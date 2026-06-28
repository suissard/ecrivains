<template>
  <div class="bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-sm mb-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-xl font-bold text-gray-800">Rédaction du Livre ✍️</h3>
        <p class="text-gray-500 text-sm mt-1">Générez tous vos chapitres à la suite ou rédigez-les un par un à votre rythme.</p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="startWritingAll" 
          :disabled="isWriting" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <svg v-if="isWriting && writingMode === 'all'" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isWriting && writingMode === 'all'">Rédaction ({{ currentWritingChapter }}/{{ totalChapters }})...</span>
          <span v-else>🚀 Tout générer à la suite</span>
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="isWriting || chapitres.length > 0" class="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
      <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" :style="{ width: `${(chapitres.length / totalChapters) * 100}%` }"></div>
    </div>

    <!-- Chapitres Liste Fusionnée -->
    <div class="space-y-4">
      <div class="flex justify-between items-center border-b pb-2 mb-4">
        <h4 class="font-bold text-gray-700 text-sm">Liste des chapitres :</h4>
        <button @click="bookStore.fetchChapitres" class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 font-medium rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Actualiser les chapitres
        </button>
      </div>

      <div v-for="(chap, idx) in parsedStructure" :key="idx" class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
        <!-- Chapter Header -->
        <div class="bg-gray-50 px-5 py-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100/70" @click="toggleChapterOpen(chap.chapNum || idx + 1)">
          <div class="flex items-center gap-2 min-w-0">
            <span class="bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">{{ chap.chapNum || idx + 1 }}</span>
            <h3 class="font-bold text-gray-800 text-base md:text-lg truncate">
              {{ chap.title || chap.titre || `Chapitre ${chap.chapNum || idx + 1}` }}
            </h3>
          </div>
          
          <div class="flex items-center gap-4 flex-shrink-0">
            <!-- Status Badge -->
            <span v-if="isChapterWritten(chap.chapNum || idx + 1)" class="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              Rédigé
            </span>
            <span v-else class="text-xs bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-medium">
              Non rédigé
            </span>

            <!-- Rédiger / Régénérer Button -->
            <button 
              @click.stop="writeSingleChapter(chap.chapNum || idx + 1)"
              :disabled="isWriting"
              class="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              <svg v-if="isWriting && writingMode === 'single' && currentWritingChapter === (chap.chapNum || idx + 1)" class="animate-spin h-3.5 w-3.5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isChapterWritten(chap.chapNum || idx + 1) ? 'Régénérer' : 'Rédiger' }}</span>
            </button>

            <!-- Arrow Icon -->
            <span class="text-gray-500">
              <svg v-if="isChapterOpen(chap.chapNum || idx + 1)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </span>
          </div>
        </div>

        <!-- Chapter Body (Expanded/Collapsed content) -->
        <div>
          <!-- Expanded + Written -->
          <div v-if="isChapterOpen(chap.chapNum || idx + 1) && isChapterWritten(chap.chapNum || idx + 1)" class="p-6 md:p-8 prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap text-lg border-t border-gray-100 animate-fade-in">
            {{ getChapterContenu(chap.chapNum || idx + 1) }}
          </div>

          <!-- Expanded + Not Written -->
          <div v-else-if="isChapterOpen(chap.chapNum || idx + 1) && !isChapterWritten(chap.chapNum || idx + 1)" class="p-6 text-center text-gray-500 border-t border-gray-100 bg-gray-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p class="text-sm font-medium">Ce chapitre n'est pas encore rédigé.</p>
            <p class="text-xs text-gray-400 mt-1">Cliquez sur le bouton "Rédiger" ci-dessus pour lancer la génération de ce chapitre.</p>
          </div>

          <!-- Collapsed (shows summary) -->
          <div v-else class="p-5 bg-gray-50/50 text-gray-600 border-t border-gray-100 text-sm italic whitespace-pre-wrap">
            <strong class="text-indigo-700 not-italic block mb-1">Résumé de la structure :</strong>
            {{ chap.resume || 'Aucun résumé défini.' }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="statusMessage" :class="['text-sm font-medium p-3 rounded-lg mt-4 text-center transition-colors', statusError ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700']">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useBookStore } from '../stores/bookStore';

const bookStore = useBookStore();
const { 
  form, 
  receivedStructure, 
  receivedPersonnages, 
  selectedModel, 
  webhookChapitresUrl,
  chapitres
} = storeToRefs(bookStore);

const isWriting = ref(false);
const writingMode = ref('all'); // 'all' or 'single'
const currentWritingChapter = ref(1);
const statusMessage = ref('');
const statusError = ref(false);

const openChapters = ref({}); // Keep track of open chapter numbers

const totalChapters = computed(() => form.value.chapitres);

// Parse structure from store to render list of chapters
const parsedStructure = computed(() => {
  try {
    let parsed = typeof receivedStructure.value === 'string' ? JSON.parse(receivedStructure.value) : receivedStructure.value;
    
    // Check if nested
    if (parsed && !Array.isArray(parsed)) {
       if (parsed.structureRecit && Array.isArray(parsed.structureRecit)) {
         parsed = parsed.structureRecit;
       } else if (parsed.structure && Array.isArray(parsed.structure)) {
         parsed = parsed.structure;
       }
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch(e) {
    return [];
  }
});

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
    const content = json.chapitre || json.chapter || json.text || json.content || json.response || json;
    return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  } catch (e) {
    return textResponse;
  }
};

const getChapterTitle = (index) => {
  const chap = parsedStructure.value[index];
  return chap ? (chap.title || chap.titre || `Chapitre ${index + 1}`) : `Chapitre ${index + 1}`;
};

const getChapterResume = (index) => {
  const chap = parsedStructure.value[index];
  return chap ? (chap.resume || chap.summary || '') : '';
};

const isChapterWritten = (num) => {
  return chapitres.value.some(c => c.numero === num);
};

const isChapterOpen = (num) => {
  // If the user hasn't interacted, closed by default. Except if we just generated it, we set it to true.
  return openChapters.value[num] === true;
};

const toggleChapterOpen = (num) => {
  openChapters.value[num] = !isChapterOpen(num);
};

const getChapterContenu = (num) => {
  const chap = chapitres.value.find(c => c.numero === num);
  return chap ? chap.contenu : '';
};

const getPreviousChapterText = (num) => {
  if (num <= 1) return '';
  const prev = chapitres.value.find(c => c.numero === num - 1);
  return prev ? prev.contenu : '';
};

// Generic single chapter generator helper
async function generateChapterCall(num) {
  const chapterTitle = getChapterTitle(num - 1);
  const chapterResume = getChapterResume(num - 1);
  const previousChapterText = getPreviousChapterText(num);
  
  const baseData = { 
    pitch: form.value.pitch, 
    nombre_de_chapitres: form.value.chapitres, 
    contexte: { ...form.value.contexte }, 
    style: { ...form.value.style } 
  };

  const payload = {
    action: 'generer_chapitre',
    chapNum: num,
    title: chapterTitle,
    resume: chapterResume,
    previous_chapter: previousChapterText,
    base: baseData,
    structure: receivedStructure.value,
    personnages: receivedPersonnages.value,
    modele: selectedModel.value
  };

  const response = await fetch(getProxiedUrl(webhookChapitresUrl.value), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Erreur réseau lors de la génération');

  const dataText = await response.text();
  const chapterContent = parseResponseContent(dataText);

  // Update or insert chapter
  const existingIdx = chapitres.value.findIndex(c => c.numero === num);
  const chapterObj = {
    numero: num,
    titre: chapterTitle,
    resume: chapterResume,
    contenu: chapterContent,
    isOpen: true
  };

  if (existingIdx !== -1) {
    chapitres.value[existingIdx] = chapterObj;
  } else {
    chapitres.value.push(chapterObj);
  }

  // Keep chapters sorted by number
  chapitres.value.sort((a, b) => a.numero - b.numero);

  // Auto open the chapter
  openChapters.value[num] = true;

  return chapterContent;
}

// Generate a single chapter
async function writeSingleChapter(num) {
  if (isWriting.value) return;
  
  isWriting.value = true;
  writingMode.value = 'single';
  currentWritingChapter.value = num;
  statusError.value = false;
  statusMessage.value = `Rédaction du chapitre ${num} en cours...`;

  try {
    await generateChapterCall(num);
    statusMessage.value = `✅ Chapitre ${num} rédigé avec succès !`;
  } catch (error) {
    console.error(`Erreur lors du chapitre ${num}:`, error);
    statusError.value = true;
    statusMessage.value = `Erreur lors de la rédaction du chapitre ${num}.`;
  } finally {
    isWriting.value = false;
  }
}

// Generate all chapters sequentially
async function startWritingAll() {
  if (isWriting.value) return;
  
  isWriting.value = true;
  writingMode.value = 'all';
  statusError.value = false;
  statusMessage.value = 'Initialisation de la rédaction globale...';
  
  // Clear previous chapters for a clean start
  chapitres.value = [];

  for (let i = 1; i <= totalChapters.value; i++) {
    currentWritingChapter.value = i;
    statusMessage.value = `Rédaction du chapitre ${i} en cours...`;
    
    try {
      await generateChapterCall(i);
    } catch (error) {
      console.error(`Erreur lors du chapitre ${i}:`, error);
      statusError.value = true;
      statusMessage.value = `Erreur lors de la rédaction du chapitre ${i}. La génération en série a été interrompue.`;
      isWriting.value = false;
      return;
    }
  }
  
  statusMessage.value = '✨ Le livre a été entièrement rédigé !';
  isWriting.value = false;
}
</script>
