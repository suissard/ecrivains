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

const loadWebhook = (key, defaultVal) => {
  let val = localStorage.getItem(key);
  if (val) {
    if (val.includes('/webhook-test/')) {
      val = val.replace('/webhook-test/', '/webhook/');
      localStorage.setItem(key, val);
    }
    if ((key === 'webhookPersonnagesUrl' || key === 'webhookChapitresUrl') && val === 'https://n8n.clavier.dev/webhook/chapitres') {
      val = defaultVal;
      localStorage.setItem(key, val);
    }
    return val;
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
    titre: '',
    pitch: '',
    chapitres: 5,
    contexte: { epoque: '', culture: '', lieu: '' },
    style: { ...initialStyle }
  };
  const form = reactive(loadFromStorage('bookApp_form', defaultForm));
  if (form.titre === undefined) {
    form.titre = '';
  }
  
  const receivedStructure = ref(localStorage.getItem('bookApp_structure') || '');
  const receivedPersonnages = ref(localStorage.getItem('bookApp_personnages') || '');
  
  const stepWarnings = ref(loadFromStorage('bookApp_stepWarnings', {
    2: false,
    3: false,
    4: false
  }));
  
  const chapitres = ref(loadFromStorage('bookApp_chapitres', []));
  
  const exportSettings = reactive(loadFromStorage('bookApp_exportSettings', {
    police: 'serif',
    taille: 11,
    marges: 2.5,
    format: 'A4',
    modeLivret: false,
    feuillesParCahier: 4
  }));
  if (exportSettings.format === undefined) {
    exportSettings.format = 'A4';
  }
  if (exportSettings.modeLivret === undefined) {
    exportSettings.modeLivret = false;
  }
  if (exportSettings.feuillesParCahier === undefined) {
    exportSettings.feuillesParCahier = 4;
  }

  const webhookUrl = ref(loadWebhook('webhookUrl', 'https://n8n.clavier.dev/webhook/structure-recit'));
  const webhookStructureUrl = ref(loadWebhook('webhookStructureUrl', 'https://n8n.clavier.dev/webhook/personnages'));
  const webhookPersonnagesUrl = ref(loadWebhook('webhookPersonnagesUrl', 'https://n8n.clavier.dev/webhook/generate-chapter'));
  const webhookChapitresUrl = ref(loadWebhook('webhookChapitresUrl', 'https://n8n.clavier.dev/webhook/generate-chapter'));
  const selectedModel = ref(localStorage.getItem('selectedModel') || 'deepseek/deepseek-v4-flash');

  // --- WATCHERS FOR LOCALSTORAGE PERSISTENCE ---
  watch(currentStep, (val) => localStorage.setItem('bookApp_currentStep', val), { deep: true });
  watch(form, (val) => localStorage.setItem('bookApp_form', JSON.stringify(val)), { deep: true });
  watch(receivedStructure, (val) => localStorage.setItem('bookApp_structure', val));
  watch(receivedPersonnages, (val) => localStorage.setItem('bookApp_personnages', val));
  watch(stepWarnings, (val) => localStorage.setItem('bookApp_stepWarnings', JSON.stringify(val)), { deep: true });
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
      let json = JSON.parse(textResponse);
      if (Array.isArray(json) && json.length > 0) {
        json = json[0];
      }
      const content = json.structureRecit || json.structure || json.personnages || json.chapitre || json.chapter || json.text || json.content || json.response || json;
      return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    } catch (e) {
      return textResponse;
    }
  };

  // Statuses for UI
  const isSubmitting = ref(false);
  const status = reactive({ show: false, isSuccess: false, message: '' });

  // Chapter Writing States
  const isWriting = ref(false);
  const writingMode = ref('all'); // 'all' or 'single'
  const currentWritingChapter = ref(1);
  const chapterStatusMessage = ref('');
  const chapterStatusError = ref(false);
  
  const submitForm = async () => {
    isSubmitting.value = true;
    status.show = false;
    currentStep.value = 2; // Transition immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Clear warning for Step 2 since we are regenerating it, and mark subsequent steps as outdated
    stepWarnings.value[2] = false;
    stepWarnings.value[3] = true;
    stepWarnings.value[4] = true;
    
    const payload = {
      base: { pitch: form.pitch, nombre_de_chapitres: form.chapitres, contexte: { ...form.contexte }, style: { ...form.style } },
      modele: selectedModel.value
    };
  
    try {
      const response = await fetch(getProxiedUrl(webhookUrl.value), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        receivedStructure.value = parseResponseContent(await response.text());
      } else throw new Error();
    } catch (error) {
      status.message = '❌ Erreur de connexion au Webhook de création de structure.';
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
      currentStep.value = 3; // Transition immediately
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Clearing warning for step 3 and setting warning for step 4
      stepWarnings.value[3] = false;
      stepWarnings.value[4] = true;
    } else {
      payload = {
        base: baseData,
        structure: receivedStructure.value,
        modele: selectedModel.value,
        corrections: userFeedback.value
      };
      // Regenerating structure also resets its warning, but invalidates subsequent steps
      stepWarnings.value[2] = false;
      stepWarnings.value[3] = true;
      stepWarnings.value[4] = true;
    }
  
    try {
      const response = await fetch(getProxiedUrl(urlToCall), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        if (validate) {
          const responseText = await response.text();
          if(responseText) {
            receivedPersonnages.value = parseResponseContent(responseText);
          }
        } else {
          receivedStructure.value = parseResponseContent(await response.text());
          status2.message = '✅ Modifications reçues. La nouvelle structure a été mise à jour.';
          status2.isSuccess = true; status2.show = true;
          userFeedback.value = ''; 
        }
      } else throw new Error();
    } catch (error) {
      if (validate) {
        status2.message = '❌ Erreur de connexion au Webhook de génération de personnages.';
      } else {
        status2.message = '❌ Erreur de connexion au Webhook de modification de structure.';
      }
      status2.isSuccess = false; status2.show = true;
    } finally { isSubmitting2.value = false; }
  };

  const isSubmitting3 = ref(false);
  const isValidating3 = ref(false);
  const status3 = reactive({ show: false, isSuccess: false, message: '' });
  const userFeedbackPersonnages = ref('');
  const autoStartChapters = ref(false);

  const submitStep3 = async (validate) => {
    isSubmitting3.value = true;
    isValidating3.value = validate;
    status3.show = false;
    
    let urlToCall = validate ? webhookPersonnagesUrl.value : webhookStructureUrl.value;
    let payload;
  
    const baseData = { pitch: form.pitch, nombre_de_chapitres: form.chapitres, contexte: { ...form.contexte }, style: { ...form.style } };
  
    if (validate) {
      let firstTitle = 'Chapitre 1';
      let firstResume = '';
      try {
        let parsedStr = typeof receivedStructure.value === 'string' ? JSON.parse(receivedStructure.value) : receivedStructure.value;
        if (parsedStr && !Array.isArray(parsedStr)) {
          parsedStr = parsedStr.structureRecit || parsedStr.structure || parsedStr;
        }
        if (Array.isArray(parsedStr) && parsedStr[0]) {
          firstTitle = parsedStr[0].title || parsedStr[0].titre || 'Chapitre 1';
          firstResume = parsedStr[0].resume || parsedStr[0].summary || '';
        }
      } catch(e) {}

      payload = {
        action: 'valider',
        chapNum: 1,
        title: firstTitle,
        resume: firstResume,
        previous_chapter: '',
        base: baseData,
        structure: receivedStructure.value,
        personnages: receivedPersonnages.value,
        modele: selectedModel.value
      };
      currentStep.value = 4; // Transition immediately
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Clearing warning for step 4
      stepWarnings.value[4] = false;
    } else {
      payload = {
        base: baseData,
        structure: receivedStructure.value,
        personnages: receivedPersonnages.value,
        modele: selectedModel.value,
        corrections: userFeedbackPersonnages.value
      };
      // Regenerating personnages resets its warning, but invalidates subsequent steps
      stepWarnings.value[3] = false;
      stepWarnings.value[4] = true;
    }
  
    try {
      const response = await fetch(getProxiedUrl(urlToCall), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        if (validate) {
          // Clear old chapters (overwrite old data)
          chapitres.value = [];
          
          const responseText = await response.text();
          if (responseText && responseText.trim() !== '') {
            let firstTitle = 'Chapitre 1';
            let firstResume = '';
            try {
              let parsedStr = typeof receivedStructure.value === 'string' ? JSON.parse(receivedStructure.value) : receivedStructure.value;
              if (parsedStr && !Array.isArray(parsedStr)) {
                parsedStr = parsedStr.structureRecit || parsedStr.structure || parsedStr;
              }
              if (Array.isArray(parsedStr) && parsedStr[0]) {
                firstTitle = parsedStr[0].title || parsedStr[0].titre || 'Chapitre 1';
                firstResume = parsedStr[0].resume || parsedStr[0].summary || '';
              }
            } catch(e) {}

            const chapterContent = parseResponseContent(responseText);
            chapitres.value.push({
              numero: 1,
              titre: firstTitle,
              resume: firstResume,
              contenu: chapterContent,
              isOpen: true
            });
          }
          autoStartChapters.value = true;
        } else {
          receivedPersonnages.value = parseResponseContent(await response.text());
          status3.message = '✅ Modifications reçues. Les personnages ont été mis à jour.';
          status3.isSuccess = true; status3.show = true;
          userFeedbackPersonnages.value = ''; 
        }
      } else throw new Error();
    } catch (error) {
      if (validate) {
        status3.message = '❌ Erreur de connexion au Webhook de génération de chapitres.';
      } else {
        status3.message = '❌ Erreur de connexion au Webhook de modification de personnages.';
      }
      status3.isSuccess = false; status3.show = true;
    } finally { isSubmitting3.value = false; }
  };

  const fetchChapitres = async () => {
    try {
      const payload = {
        action: 'recuperer',
        base: { 
          pitch: form.pitch, 
          nombre_de_chapitres: form.chapitres, 
          contexte: { ...form.contexte }, 
          style: { ...form.style } 
        },
        structure: receivedStructure.value,
        personnages: receivedPersonnages.value,
        modele: selectedModel.value
      };
      
      const response = await fetch(getProxiedUrl(webhookChapitresUrl.value), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(response.ok) {
        const data = await response.json();
        const normalize = (c, index) => {
          return {
            numero: c.numero || c.chapNum || c.num || (index + 1),
            titre: c.titre || c.title || '',
            contenu: c.contenu || c.chapter || c.chapitre || c.text || c.content || '',
            isOpen: c.isOpen !== undefined ? c.isOpen : false
          };
        };
        if (Array.isArray(data)) {
          chapitres.value = data.map((c, index) => normalize(c, index));
        } else if (data.chapitres && Array.isArray(data.chapitres)) {
          chapitres.value = data.chapitres.map((c, index) => normalize(c, index));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des chapitres", error);
      alert("Impossible de récupérer les chapitres pour le moment.");
    }
  };

  const resetAllData = () => {
    currentStep.value = 1;
    form.titre = '';
    form.pitch = '';
    form.chapitres = 5;
    form.contexte = { epoque: '', culture: '', lieu: '' };
    form.style = { ...initialStyle };
    receivedStructure.value = '';
    receivedPersonnages.value = '';
    chapitres.value = [];
  };

  const deleteChapter = (num) => {
    chapitres.value = chapitres.value.filter(c => c.numero !== num);
  };

  const resetStep = (stepNum) => {
    if (stepNum === 1) {
      form.titre = '';
      form.pitch = '';
      form.chapitres = 5;
      form.contexte = { epoque: '', culture: '', lieu: '' };
      form.style = { ...initialStyle };
    } else if (stepNum === 2) {
      receivedStructure.value = '';
    } else if (stepNum === 3) {
      receivedPersonnages.value = '';
    } else if (stepNum === 4) {
      chapitres.value = [];
    }
  };


  const exportStoryData = () => {
    return {
      currentStep: currentStep.value,
      form: form,
      receivedStructure: receivedStructure.value,
      receivedPersonnages: receivedPersonnages.value,
      stepWarnings: stepWarnings.value,
      chapitres: chapitres.value
    };
  };

  const importStoryData = (data) => {
    if (data.currentStep !== undefined) currentStep.value = data.currentStep;
    if (data.form !== undefined) {
      Object.assign(form, data.form);
    }
    if (data.receivedStructure !== undefined) receivedStructure.value = data.receivedStructure;
    if (data.receivedPersonnages !== undefined) receivedPersonnages.value = data.receivedPersonnages;
    if (data.stepWarnings !== undefined) stepWarnings.value = data.stepWarnings;
    if (data.chapitres !== undefined) chapitres.value = data.chapitres;
  };

  return {
    exportStoryData,
    importStoryData,
    currentStep,
    form,
    receivedStructure,
    receivedPersonnages,
    stepWarnings,
    autoStartChapters,
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
    fetchChapitres,
    resetAllData,
    deleteChapter,
    resetStep,
    isWriting, writingMode, currentWritingChapter, chapterStatusMessage, chapterStatusError
  };
});
