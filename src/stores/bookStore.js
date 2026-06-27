import { defineStore } from 'pinia';
import { ref, reactive, watch } from 'vue';

const loadFromStorage = (key, defaultVal) => {
  const val = localStorage.getItem(key);
  if (val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return defaultVal;
};

export const useBookStore = defineStore('book', () => {
  // --- STATE ---
  const currentStep = ref(parseInt(loadFromStorage('bookApp_currentStep', 1), 10));
  
  const initialStyle = {
    longueurPhrases: 5, complexiteGrammaticale: 5, densiteDescriptive: 5, registreLangue: 5,
    natureLexique: 5, richesseLexicale: 5, rythme: 5, engagementEmotionnel: 5,
    tonaliteHumour: 5, explicitation: 5, introspection: 5
  };
  
  const defaultForm = {
    pitch: '',
    chapitres: 5,
    contexte: { epoque: '', culture: '', lieu: '' },
    style: { ...initialStyle }
  };
  const form = reactive(loadFromStorage('bookApp_form', defaultForm));
  
  const receivedStructure = ref(loadFromStorage('bookApp_structure', ''));
  const receivedPersonnages = ref(loadFromStorage('bookApp_personnages', ''));
  
  const chapitres = ref(loadFromStorage('bookApp_chapitres', []));
  
  const exportSettings = reactive(loadFromStorage('bookApp_exportSettings', {
    police: 'serif',
    taille: 11,
    marges: 2.5
  }));

  const webhookUrl = ref(localStorage.getItem('webhookUrl') || 'https://n8n.clavier.dev/webhook-test/structure-recit');
  const webhookStructureUrl = ref(localStorage.getItem('webhookStructureUrl') || 'https://n8n.clavier.dev/webhook-test/personnages');
  const webhookPersonnagesUrl = ref(localStorage.getItem('webhookPersonnagesUrl') || 'https://n8n.clavier.dev/webhook-test/chapitres');
  const webhookChapitresUrl = ref(localStorage.getItem('webhookChapitresUrl') || 'https://n8n.clavier.dev/webhook-test/chapitres');
  const selectedModel = ref(localStorage.getItem('selectedModel') || 'deepseek/deepseek-v4-flash');

  // --- WATCHERS FOR LOCALSTORAGE PERSISTENCE ---
  watch(currentStep, (val) => localStorage.setItem('bookApp_currentStep', val), { deep: true });
  watch(form, (val) => localStorage.setItem('bookApp_form', JSON.stringify(val)), { deep: true });
  watch(receivedStructure, (val) => localStorage.setItem('bookApp_structure', val));
  watch(receivedPersonnages, (val) => localStorage.setItem('bookApp_personnages', val));
  watch(chapitres, (val) => localStorage.setItem('bookApp_chapitres', JSON.stringify(val)), { deep: true });
  watch(exportSettings, (val) => localStorage.setItem('bookApp_exportSettings', JSON.stringify(val)), { deep: true });
  
  watch(webhookUrl, (val) => localStorage.setItem('webhookUrl', val));
  watch(webhookStructureUrl, (val) => localStorage.setItem('webhookStructureUrl', val));
  watch(webhookPersonnagesUrl, (val) => localStorage.setItem('webhookPersonnagesUrl', val));
  watch(webhookChapitresUrl, (val) => localStorage.setItem('webhookChapitresUrl', val));
  watch(selectedModel, (val) => localStorage.setItem('selectedModel', val));

  // --- ACTIONS ---
  const getProxiedUrl = (url) => {
    if (import.meta.env.DEV && url.includes('n8n.clavier.dev')) {
      return url.replace('https://n8n.clavier.dev', '/n8n-proxy');
    }
    return url;
  };

  const parseResponseContent = (textResponse) => {
    try {
      const json = JSON.parse(textResponse);
      const content = json.structureRecit || json.structure || json.personnages || json.text || json.content || json.response || json;
      return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    } catch (e) {
      return textResponse;
    }
  };

  // Statuses for UI
  const isSubmitting = ref(false);
  const status = reactive({ show: false, isSuccess: false, message: '' });
  
  const submitForm = async () => {
    isSubmitting.value = true;
    status.show = false;
    const payload = {
      base: { pitch: form.pitch, nombre_de_chapitres: form.chapitres, contexte: { ...form.contexte }, style: { ...form.style } },
      modele: selectedModel.value
    };
  
    try {
      const response = await fetch(getProxiedUrl(webhookUrl.value), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        receivedStructure.value = parseResponseContent(await response.text());
        currentStep.value = 2; 
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else throw new Error();
    } catch (error) {
      status.message = '❌ Erreur de connexion au Webhook de création.';
      status.isSuccess = false; status.show = true;
    } finally { isSubmitting.value = false; }
  };

  const isSubmitting2 = ref(false);
  const isValidating = ref(false);
  const status2 = reactive({ show: false, isSuccess: false, message: '' });
  const userFeedback = ref('');

  const submitStep2 = async (validate) => {
    isSubmitting2.value = true;
    isValidating.value = validate;
    status2.show = false;
    
    let urlToCall = validate ? webhookStructureUrl.value : webhookUrl.value;
    let payload;
  
    const baseData = { pitch: form.pitch, nombre_de_chapitres: form.chapitres, contexte: { ...form.contexte }, style: { ...form.style } };
  
    if (validate) {
      payload = {
        action: 'valider',
        base: baseData,
        structure: receivedStructure.value,
        modele: selectedModel.value
      };
    } else {
      payload = {
        base: baseData,
        structure: receivedStructure.value,
        modele: selectedModel.value,
        corrections: userFeedback.value
      };
    }
  
    try {
      const response = await fetch(getProxiedUrl(urlToCall), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        if (validate) {
          const responseText = await response.text();
          if(responseText) {
            receivedPersonnages.value = parseResponseContent(responseText);
          }
          currentStep.value = 3;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          receivedStructure.value = parseResponseContent(await response.text());
          status2.message = '✅ Modifications reçues. La nouvelle structure a été mise à jour.';
          status2.isSuccess = true; status2.show = true;
          userFeedback.value = ''; 
        }
      } else throw new Error();
    } catch (error) {
      status2.message = '❌ Erreur de connexion au Webhook.';
      status2.isSuccess = false; status2.show = true;
    } finally { isSubmitting2.value = false; }
  };

  const isSubmitting3 = ref(false);
  const isValidating3 = ref(false);
  const status3 = reactive({ show: false, isSuccess: false, message: '' });
  const userFeedbackPersonnages = ref('');

  const submitStep3 = async (validate) => {
    isSubmitting3.value = true;
    isValidating3.value = validate;
    status3.show = false;
    
    let urlToCall = validate ? webhookPersonnagesUrl.value : webhookStructureUrl.value;
    let payload;
  
    const baseData = { pitch: form.pitch, nombre_de_chapitres: form.chapitres, contexte: { ...form.contexte }, style: { ...form.style } };
  
    if (validate) {
      payload = {
        action: 'valider',
        base: baseData,
        structure: receivedStructure.value,
        personnages: receivedPersonnages.value,
        modele: selectedModel.value
      };
    } else {
      payload = {
        base: baseData,
        structure: receivedStructure.value,
        personnages: receivedPersonnages.value,
        modele: selectedModel.value,
        corrections: userFeedbackPersonnages.value
      };
    }
  
    try {
      const response = await fetch(getProxiedUrl(urlToCall), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        if (validate) {
          currentStep.value = 4;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          receivedPersonnages.value = parseResponseContent(await response.text());
          status3.message = '✅ Modifications reçues. Les personnages ont été mis à jour.';
          status3.isSuccess = true; status3.show = true;
          userFeedbackPersonnages.value = ''; 
        }
      } else throw new Error();
    } catch (error) {
      status3.message = '❌ Erreur de connexion au Webhook.';
      status3.isSuccess = false; status3.show = true;
    } finally { isSubmitting3.value = false; }
  };

  const fetchChapitres = async () => {
    try {
      const response = await fetch(getProxiedUrl(webhookChapitresUrl.value));
      if(response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          chapitres.value = data.map(c => ({ ...c, isOpen: false }));
        } else if (data.chapitres && Array.isArray(data.chapitres)) {
          chapitres.value = data.chapitres.map(c => ({ ...c, isOpen: false }));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des chapitres", error);
      alert("Impossible de récupérer les chapitres pour le moment.");
    }
  };

  return {
    currentStep,
    form,
    receivedStructure,
    receivedPersonnages,
    chapitres,
    exportSettings,
    webhookUrl,
    webhookStructureUrl,
    webhookPersonnagesUrl,
    webhookChapitresUrl,
    selectedModel,
    isSubmitting, status, submitForm,
    isSubmitting2, isValidating, status2, userFeedback, submitStep2,
    isSubmitting3, isValidating3, status3, userFeedbackPersonnages, submitStep3,
    fetchChapitres
  };
});
