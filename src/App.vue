<template>
  <div class="bg-gray-100 text-gray-800 font-sans min-h-screen p-4 md:p-8 relative">
    <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-indigo-600 p-6 text-white text-center">
        <h1 class="text-3xl font-bold">📚 Création de Livre IA</h1>
      </div>

      <!-- STEPPER -->
      <nav aria-label="Progress" class="py-6 px-2 md:px-12 bg-gray-50 border-b">
        <ol role="list" class="flex items-center justify-between">
          <li v-for="(step, index) in stepsList" :key="step.id" class="relative flex flex-col items-center flex-1">
            <!-- Line -->
            <div v-if="index !== stepsList.length - 1" class="absolute top-4 md:top-5 left-1/2 w-full h-1" :class="currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-200'" aria-hidden="true"></div>
            
            <!-- Circle -->
            <button @click="currentStep = step.id" class="relative z-10 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white border-2 transition-all cursor-pointer" :class="[currentStep >= step.id ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-400', currentStep === step.id ? 'bg-indigo-100 ring-4 ring-indigo-50' : 'bg-white', currentStep > step.id ? 'bg-indigo-600 !text-white !border-indigo-600' : 'hover:border-gray-400']">
              <svg v-if="currentStep > step.id" class="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="text-sm md:text-base font-bold">{{ step.id }}</span>
            </button>
            
            <!-- Text -->
            <span class="mt-2 text-[10px] md:text-xs font-bold text-center uppercase tracking-wider" :class="currentStep >= step.id ? 'text-indigo-700' : 'text-gray-400'">{{ step.name }}</span>
          </li>
        </ol>
      </nav>

      <!-- ÉTAPE 1: FORMULAIRE INITIAL -->
      <form v-if="currentStep === 1" @submit.prevent="submitForm" class="p-6 md:p-10 space-y-8 animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Base du récit</h2>
          <p class="text-gray-500 mt-1">Définissez l'histoire, le contexte et le style d'écriture</p>
        </div>

        <!-- SECTION: HISTOIRE -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2 text-indigo-700">1. L'Histoire</h2>
          
          <div>
            <label class="block text-sm font-medium mb-1">Pitch général *</label>
            <textarea v-model="form.pitch" required rows="4" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border" placeholder="Un topo sur l'histoire générale..."></textarea>
          </div>
          
          <div class="w-1/3 min-w-[200px]">
            <label class="block text-sm font-medium mb-1">Nombre de chapitres *</label>
            <input type="number" v-model.number="form.chapitres" required min="1" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border">
          </div>
        </section>

        <!-- SECTION: CONTEXTE -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2 text-indigo-700">2. Le Contexte</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Époque</label>
              <input type="text" v-model="form.contexte.epoque" class="w-full border-gray-300 rounded-lg shadow-sm p-3 border" placeholder="Ex: Années 20, Futuriste...">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Culture</label>
              <input type="text" v-model="form.contexte.culture" class="w-full border-gray-300 rounded-lg shadow-sm p-3 border" placeholder="Ex: Cyberpunk, Médiévale...">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Lieu</label>
              <input type="text" v-model="form.contexte.lieu" class="w-full border-gray-300 rounded-lg shadow-sm p-3 border" placeholder="Ex: Paris, Mars...">
            </div>
          </div>
        </section>

        <!-- SECTION: STYLE D'ÉCRITURE -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2 text-indigo-700">3. Style d'Écriture (1 à 10)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="item in styleConfig" :key="item.id" class="bg-gray-50 p-4 rounded-lg border">
              <div class="flex justify-between items-center mb-2">
                <label class="font-medium text-sm text-gray-700">{{ item.label }}</label>
                <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">{{ form.style[item.id] }}</span>
              </div>
              <input type="range" v-model.number="form.style[item.id]" min="1" max="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
              <div class="flex justify-between text-xs text-gray-500 mt-2">
                <span>{{ item.minLabel }}</span>
                <span>{{ item.maxLabel }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- SUBMIT -->
        <section class="pt-6 border-t space-y-4">
          <button type="submit" :disabled="isSubmitting" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="isSubmitting">⏳ Génération de la structure en cours...</span>
            <span v-else>🚀 Suivant : Générer la structure</span>
          </button>
        </section>
        
        <div v-if="status.show" :class="['rounded-lg p-4 text-center font-medium', status.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ status.message }}
        </div>
      </form>

      <!-- ÉTAPE 2: VALIDATION DE LA STRUCTURE -->
      <div v-if="currentStep === 2" class="p-6 md:p-10 space-y-8 animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Structure du Récit</h2>
          <p class="text-gray-500 mt-1">Validez ou demandez des modifications sur la structure proposée</p>
        </div>

        <section class="space-y-6">
          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="block text-sm font-medium">Structure proposée</label>
              <button @click="showRawStructure = !showRawStructure" type="button" class="text-xs text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                <svg v-if="!showRawStructure" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {{ showRawStructure ? 'Mode Visuel' : 'Mode JSON Brut' }}
              </button>
            </div>
            
            <div v-if="!showRawStructure && structureCards && structureCards.length > 0" class="space-y-4">
              <div v-for="(chap, idx) in structureCards" :key="idx" class="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
                <div class="flex justify-between items-center mb-3">
                  <div class="flex items-center gap-2">
                    <span class="bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{{ chap.chapNum || idx + 1 }}</span>
                    <h3 class="font-bold text-indigo-800">Chapitre {{ chap.chapNum || idx + 1 }}</h3>
                  </div>
                  <button @click="removeChapter(idx)" type="button" class="text-red-500 hover:bg-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Supprimer ce chapitre">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <input type="text" v-model="chap.title" class="w-full font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg p-2.5 mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="Titre du chapitre" />
                <textarea v-model="chap.resume" v-auto-resize rows="2" class="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none overflow-hidden" placeholder="Résumé du chapitre..."></textarea>
              </div>
              
              <button @click="addChapter" type="button" class="w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-medium transition-colors flex justify-center items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Ajouter un chapitre
              </button>
            </div>

            <div v-else>
              <textarea v-model="receivedStructure" rows="15" class="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-4 border font-mono text-sm leading-relaxed" placeholder="La structure générée apparaîtra ici (format JSON supporté)..."></textarea>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Demande de modification (Optionnel)</label>
            <textarea v-model="userFeedback" rows="3" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border" placeholder="Ex: Rendre le chapitre 3 plus sombre..."></textarea>
          </div>
        </section>

        <section class="pt-6 border-t flex flex-col md:flex-row gap-4">
          <button @click="submitStep2(false)" :disabled="isSubmitting2" class="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-4 px-8 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="isSubmitting2 && !isValidating">⏳ Envoi...</span>
            <span v-else>🔄 Demander modifications</span>
          </button>
          <button @click="submitStep2(true)" :disabled="isSubmitting2" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="isSubmitting2 && isValidating">⏳ Validation...</span>
            <span v-else>✅ Valider la structure</span>
          </button>
        </section>
        
        <div v-if="status2.show" :class="['rounded-lg p-4 text-center font-medium', status2.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ status2.message }}
        </div>
      </div>

      <!-- ÉTAPE 3: PERSONNAGES -->
      <div v-if="currentStep === 3" class="p-6 md:p-10 space-y-8 animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Personnages</h2>
          <p class="text-gray-500 mt-1">Découvrez et ajustez les personnages de votre récit</p>
        </div>

        <section class="space-y-6">
          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="block text-sm font-medium">Liste des personnages et caractéristiques (Modifiable)</label>
              <button @click="showRawPersonnages = !showRawPersonnages" type="button" class="text-xs text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                <svg v-if="!showRawPersonnages" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {{ showRawPersonnages ? 'Mode Visuel' : 'Mode JSON Brut' }}
              </button>
            </div>

            <div v-if="!showRawPersonnages && personnagesCards && personnagesCards.length > 0" class="space-y-4">
              <div v-for="(perso, idx) in personnagesCards" :key="idx" class="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center gap-2 w-full">
                    <span class="bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">{{ idx + 1 }}</span>
                    <input type="text" v-model="perso.Nom" class="font-bold text-indigo-800 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none px-1 py-0.5 text-lg w-full max-w-sm" placeholder="Nom du personnage" />
                  </div>
                  <button @click="removePersonnage(idx)" type="button" class="text-red-500 hover:bg-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Supprimer ce personnage">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="(value, key) in perso" :key="key" v-show="key !== 'Nom'">
                    <label class="block text-xs font-semibold text-gray-500 mb-1 capitalize">{{ String(key).replace(/_/g, ' ') }}</label>
                    <textarea v-model="perso[key]" v-auto-resize rows="1" class="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none overflow-hidden" :placeholder="String(key).replace(/_/g, ' ')"></textarea>
                  </div>
                </div>
              </div>
              
              <button @click="addPersonnage" type="button" class="w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-medium transition-colors flex justify-center items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Ajouter un personnage
              </button>
            </div>

            <div v-else>
              <textarea v-model="receivedPersonnages" rows="15" class="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-4 border font-mono text-sm leading-relaxed" placeholder="Les personnages générés apparaîtront ici (format JSON supporté)..."></textarea>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Demande de modification (Optionnel)</label>
            <textarea v-model="userFeedbackPersonnages" rows="3" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border" placeholder="Ex: Ajouter un antagoniste plus rusé ou changer le métier du héros..."></textarea>
          </div>
        </section>

        <section class="pt-6 border-t flex flex-col md:flex-row gap-4">
          <button @click="submitStep3(false)" :disabled="isSubmitting3" class="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-4 px-8 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="isSubmitting3 && !isValidating3">⏳ Envoi...</span>
            <span v-else>🔄 Demander modifications</span>
          </button>
          <button @click="submitStep3(true)" :disabled="isSubmitting3" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="isSubmitting3 && isValidating3">⏳ Validation...</span>
            <span v-else>✅ Valider les personnages</span>
          </button>
        </section>
        
        <div v-if="status3.show" :class="['rounded-lg p-4 text-center font-medium', status3.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ status3.message }}
        </div>
      </div>

      <!-- ÉTAPE 4: CHAPITRES -->
      <div v-if="currentStep === 4" class="p-6 md:p-10 space-y-8 animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Lecture des Chapitres</h2>
          <p class="text-gray-500 mt-1">Lisez votre récit au fur et à mesure de sa création</p>
        </div>

        <section class="space-y-4">
          <div class="flex justify-end border-b pb-2">
            <button @click="fetchChapitres" class="text-sm bg-indigo-100 text-indigo-700 px-4 py-2 font-medium rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Actualiser les chapitres
            </button>
          </div>
          
          <div v-if="chapitres.length === 0" class="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Aucun chapitre n'est encore disponible.<br> Lancez la génération depuis n8n et actualisez la page.
          </div>
          
          <div v-else class="space-y-6">
            <div v-for="(chap, idx) in chapitres" :key="idx" class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
              <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100" @click="chap.isOpen = !chap.isOpen">
                <h3 class="font-bold text-gray-800 text-lg">Chapitre {{ chap.numero }} <span v-if="chap.titre" class="font-normal opacity-75"> - {{ chap.titre }}</span></h3>
                <span class="text-gray-500">
                  <svg v-if="chap.isOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </span>
              </div>
              <div v-if="chap.isOpen" class="p-6 md:p-8 prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                {{ chap.contenu }}
              </div>
            </div>
          </div>
        </section>

        <section class="pt-6 border-t mt-8">
          <button @click="currentStep = 5" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 text-lg">
            <span>Aller à l'exportation finale ➡️</span>
          </button>
        </section>
      </div>

      <!-- ÉTAPE 5: FINALE -->
      <div v-if="currentStep === 5" class="p-6 md:p-10 space-y-8 animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Finalisation et Export</h2>
          <p class="text-gray-500 mt-1">Personnalisez le rendu de votre livre avant impression</p>
        </div>

        <section class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <!-- Settings -->
            <div class="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 class="font-bold text-gray-800 mb-4 text-lg border-b pb-2">Paramètres de mise en page</h3>
              
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">Police de caractères</label>
                <select v-model="exportSettings.police" class="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="serif">Serif (Classique, style Roman)</option>
                  <option value="sans-serif">Sans-serif (Moderne, Épuré)</option>
                  <option value="monospace">Monospace (Machine à écrire)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700 flex justify-between">
                  <span>Taille des caractères</span>
                  <span class="text-indigo-600 bg-indigo-50 px-2 rounded">{{ exportSettings.taille }}pt</span>
                </label>
                <input type="range" v-model.number="exportSettings.taille" min="9" max="18" class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer">
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700 flex justify-between">
                  <span>Largeur des marges (cm)</span>
                  <span class="text-indigo-600 bg-indigo-50 px-2 rounded">{{ exportSettings.marges }}cm</span>
                </label>
                <input type="range" v-model.number="exportSettings.marges" min="1" max="5" step="0.5" class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer">
              </div>
            </div>

            <!-- Preview -->
            <div class="flex flex-col">
              <h3 class="font-bold text-gray-800 mb-4 px-2 text-lg">Aperçu du rendu</h3>
              <div 
                class="flex-1 bg-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4 md:p-8 transition-all"
                :style="{ fontFamily: getPreviewFontFamily() }"
              >
                <!-- Page container -->
                <div 
                  class="bg-white shadow-xl transition-all flex flex-col items-center justify-center text-justify border relative"
                  :style="{ 
                    width: '300px',
                    height: '424px', // Aspect ratio of A5 roughly
                    padding: `${exportSettings.marges * 6}px`, 
                    fontSize: `${exportSettings.taille}px`,
                    lineHeight: '1.5'
                  }"
                >
                  <h4 class="font-bold mb-4 text-center w-full" :style="{ fontSize: `${exportSettings.taille * 1.5}px` }">Chapitre 1</h4>
                  <p class="w-full h-full overflow-hidden text-ellipsis">Il était une fois, dans une contrée lointaine, une histoire qui s'écrivait d'elle-même. Les mots coulaient sur le papier avec une fluidité déconcertante, guidés par une intelligence artificielle tissant les fils du destin de personnages encore inconnus la veille. La nuit tombait lentement sur la ville endormie, effaçant les contours...</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="pt-8 border-t mt-8">
          <button @click="genererPdf" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-8 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-3 text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Obtenir mon Livre (Format PDF)</span>
          </button>
        </section>
      </div>

    </div>

    <!-- FLOATING SETTINGS BUTTON -->
    <button @click="isSettingsOpen = true" class="fixed bottom-6 right-6 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 transition-colors z-40" title="Paramètres Webhooks">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    </button>

    <!-- SETTINGS MODAL -->
    <div v-if="isSettingsOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4 border-b pb-2">Paramètres des Webhooks & Modèles</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h4 class="font-semibold text-indigo-700">Modèle IA</h4>
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">Modèle (OpenRouter)</label>
              <div class="relative">
                <input 
                  type="text" 
                  v-model="modelSearchQuery"
                  @focus="isDropdownOpen = true"
                  @blur="closeDropdown"
                  class="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
                  placeholder="Rechercher un modèle..."
                  :disabled="isLoadingModels"
                />
                <div class="absolute right-3 top-3 text-gray-400 pointer-events-none">
                  <svg v-if="!isLoadingModels" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              
              <ul v-if="isDropdownOpen" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <li 
                  v-for="model in filteredModels" 
                  :key="model.id"
                  @mousedown.prevent="selectModel(model)"
                  class="cursor-pointer select-none relative py-2 pl-3 pr-4 hover:bg-indigo-600 hover:text-white group"
                >
                  <span class="block font-medium truncate">{{ model.name || model.id }}</span>
                  <span class="block truncate text-xs text-gray-500 group-hover:text-indigo-200">{{ model.id }}</span>
                </li>
                <li v-if="filteredModels.length === 0" class="py-2 pl-3 pr-4 text-gray-500 text-sm">
                  Aucun modèle trouvé
                </li>
              </ul>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-semibold text-indigo-700">URLs N8N</h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Étape 1 : Base du Récit</label>
              <input type="url" v-model="settingsUrl" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="https://...">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Étape 2 : Structure</label>
              <input type="url" v-model="settingsStructureUrl" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="https://...">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Étape 3 : Personnages</label>
              <input type="url" v-model="settingsPersonnagesUrl" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="https://...">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Étape 4 : Chapitres (Fetch)</label>
              <input type="url" v-model="settingsChapitresUrl" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="https://...">
            </div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t flex justify-end gap-3">
          <button type="button" @click="isSettingsOpen = false" class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Annuler</button>
          <button type="button" @click="saveSettings" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';

// --- HELPERS PERSISTANCE ---
const loadFromStorage = (key, defaultVal) => {
  const val = localStorage.getItem(key);
  if (val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val; // Cas string classique
    }
  }
  return defaultVal;
};

// --- STEPPER CONFIGURATION ---
const stepsList = [
  { id: 1, name: 'Base' },
  { id: 2, name: 'Structure' },
  { id: 3, name: 'Personnages' },
  { id: 4, name: 'Chapitres' },
  { id: 5, name: 'Finale' }
];

const currentStep = ref(1);

// --- ÉTAPE 1 : BASE DU RÉCIT ---
const styleConfig = [
  { id: 'longueurPhrases', label: 'Longueur des phrases', minLabel: 'Télégraphique', maxLabel: 'Proustien' },
  { id: 'complexiteGrammaticale', label: 'Complexité grammaticale', minLabel: 'Simple', maxLabel: 'Complexe' },
  { id: 'densiteDescriptive', label: 'Densité descriptive', minLabel: 'Minimaliste', maxLabel: 'Foisonnant' },
  { id: 'registreLangue', label: 'Registre de langue', minLabel: 'Familier', maxLabel: 'Académique' },
  { id: 'natureLexique', label: 'Nature du lexique', minLabel: 'Concret', maxLabel: 'Abstrait' },
  { id: 'richesseLexicale', label: 'Richesse lexicale', minLabel: 'Usuel', maxLabel: 'Érudit' },
  { id: 'rythme', label: 'Rythme', minLabel: 'Contemplatif', maxLabel: 'Frénétique' },
  { id: 'engagementEmotionnel', label: 'Engagement émotionnel', minLabel: 'Clinique', maxLabel: 'Lyrique' },
  { id: 'tonaliteHumour', label: 'Humour', minLabel: 'Sérieux', maxLabel: 'Satirique' },
  { id: 'explicitation', label: 'Explicitation', minLabel: 'Show/Action', maxLabel: 'Tell/Explication' },
  { id: 'introspection', label: 'Introspection', minLabel: 'Objective/Faits', maxLabel: 'Subjective/Pensées' }
];

const initialStyle = {};
styleConfig.forEach(item => { initialStyle[item.id] = 5; });

const form = reactive({
  pitch: '',
  chapitres: 5,
  contexte: { epoque: '', culture: '', lieu: '' },
  style: { ...initialStyle }
});

const isSubmitting = ref(false);
const status = reactive({ show: false, isSuccess: false, message: '' });

// --- ÉTAPE 2 : STRUCTURE ---
const isSubmitting2 = ref(false);
const isValidating = ref(false);
const status2 = reactive({ show: false, isSuccess: false, message: '' });
const receivedStructure = ref('');
const userFeedback = ref('');
const showRawStructure = ref(false);
const structureCards = ref(null);

// Directive d'auto-redimensionnement pour les textareas
const vAutoResize = {
  mounted(el) {
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };
    el.__resizeListener = resize;
    el.addEventListener('input', resize);
    setTimeout(resize, 10);
  },
  updated(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  },
  unmounted(el) {
    if (el.__resizeListener) {
      el.removeEventListener('input', el.__resizeListener);
    }
  }
};

const parseStructureData = (dataStr) => {
  if (!dataStr) return null;
  let str = typeof dataStr === 'string' ? dataStr : JSON.stringify(dataStr);
  try {
    let parsed = JSON.parse(str);
    if (parsed.structureRecit) {
      let inner = parsed.structureRecit;
      if (typeof inner === 'string') inner = JSON.parse(inner);
      if (Array.isArray(inner)) return inner;
    }
    if (Array.isArray(parsed)) return parsed;
    if (parsed.structure && Array.isArray(parsed.structure)) return parsed.structure;
  } catch (e) {
    try {
      const match = str.match(/\[.*\]/s);
      if (match) {
        const inner = JSON.parse(match[0]);
        if (Array.isArray(inner)) return inner;
      }
    } catch(err) {}
  }
  return null;
};

watch(receivedStructure, (newVal) => {
  const parsed = parseStructureData(newVal);
  if (parsed) {
    if (JSON.stringify(parsed) !== JSON.stringify(structureCards.value)) {
      structureCards.value = parsed;
    }
  } else {
    // Check safely for string before using trim
    const strVal = typeof newVal === 'string' ? newVal : JSON.stringify(newVal || '');
    if (!strVal || strVal.trim() === '' || strVal === '{}') {
      structureCards.value = null;
    }
  }
}, { immediate: true });

const updateReceivedStructureFromCards = () => {
  if (!structureCards.value) return;
  let originalObj = null;
  try { originalObj = JSON.parse(receivedStructure.value); } catch(e) {}
  
  let targetStr = '';
  if (originalObj && originalObj.structureRecit !== undefined) {
    originalObj.structureRecit = JSON.stringify(structureCards.value);
    targetStr = JSON.stringify(originalObj, null, 2);
  } else {
    targetStr = JSON.stringify(structureCards.value, null, 2);
  }
  
  if (receivedStructure.value !== targetStr) {
    receivedStructure.value = targetStr;
  }
};

watch(structureCards, (newVal) => {
  if (newVal) {
    updateReceivedStructureFromCards();
  }
}, { deep: true });

const addChapter = () => {
  if (!structureCards.value) structureCards.value = [];
  const nextNum = structureCards.value.length > 0 
    ? Math.max(...structureCards.value.map(c => c.chapNum || 0)) + 1 
    : 1;
  structureCards.value.push({
    title: `Nouveau Chapitre`,
    resume: ``,
    chapNum: nextNum
  });
};

const removeChapter = (idx) => {
  if (structureCards.value) {
    structureCards.value.splice(idx, 1);
  }
};

// --- ÉTAPE 3 : PERSONNAGES ---
const isSubmitting3 = ref(false);
const isValidating3 = ref(false);
const status3 = reactive({ show: false, isSuccess: false, message: '' });
const receivedPersonnages = ref('');
const userFeedbackPersonnages = ref('');
const showRawPersonnages = ref(false);
const personnagesCards = ref(null);

const parsePersonnagesData = (dataStr) => {
  if (!dataStr) return null;
  let str = typeof dataStr === 'string' ? dataStr : JSON.stringify(dataStr);
  try {
    let parsed = JSON.parse(str);
    
    // Si c'est un tableau contenant un objet avec "personnages_principaux" en chaîne de caractères (format n8n spécifique)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].personnages_principaux) {
      let inner = parsed[0].personnages_principaux;
      if (typeof inner === 'string') inner = JSON.parse(inner);
      if (Array.isArray(inner)) return inner;
    }
    
    // Autres cas classiques
    if (parsed.personnages_principaux) {
      let inner = parsed.personnages_principaux;
      if (typeof inner === 'string') inner = JSON.parse(inner);
      if (Array.isArray(inner)) return inner;
    }
    
    if (Array.isArray(parsed)) return parsed;
    
  } catch (e) {
    try {
      const match = str.match(/\[.*\]/s);
      if (match) {
        const inner = JSON.parse(match[0]);
        if (Array.isArray(inner)) return inner;
      }
    } catch(err) {}
  }
  return null;
};

watch(receivedPersonnages, (newVal) => {
  const parsed = parsePersonnagesData(newVal);
  if (parsed) {
    if (JSON.stringify(parsed) !== JSON.stringify(personnagesCards.value)) {
      personnagesCards.value = parsed;
    }
  } else {
    const strVal = typeof newVal === 'string' ? newVal : JSON.stringify(newVal || '');
    if (!strVal || strVal.trim() === '' || strVal === '{}') {
      personnagesCards.value = null;
    }
  }
}, { immediate: true });

const updateReceivedPersonnagesFromCards = () => {
  if (!personnagesCards.value) return;
  let originalObj = null;
  try { originalObj = JSON.parse(receivedPersonnages.value); } catch(e) {}
  
  let targetStr = '';
  if (originalObj && Array.isArray(originalObj) && originalObj.length > 0 && originalObj[0].personnages_principaux !== undefined) {
    originalObj[0].personnages_principaux = JSON.stringify(personnagesCards.value);
    targetStr = JSON.stringify(originalObj, null, 2);
  } else if (originalObj && originalObj.personnages_principaux !== undefined) {
    originalObj.personnages_principaux = JSON.stringify(personnagesCards.value);
    targetStr = JSON.stringify(originalObj, null, 2);
  } else {
    targetStr = JSON.stringify(personnagesCards.value, null, 2);
  }
  
  if (receivedPersonnages.value !== targetStr) {
    receivedPersonnages.value = targetStr;
  }
};

watch(personnagesCards, (newVal) => {
  if (newVal) {
    updateReceivedPersonnagesFromCards();
  }
}, { deep: true });

const addPersonnage = () => {
  if (!personnagesCards.value) personnagesCards.value = [];
  personnagesCards.value.push({
    Nom: 'Nouveau Personnage',
    Physique: '',
    personnalite: '',
    comportement: '',
    habilites: '',
    valeurs: ''
  });
};

const removePersonnage = (idx) => {
  if (personnagesCards.value) {
    personnagesCards.value.splice(idx, 1);
  }
};

// --- ÉTAPE 4 : CHAPITRES ---
const chapitres = ref([]);

// --- ÉTAPE 5 : FINALE ---
const exportSettings = reactive({
  police: 'serif',
  taille: 11,
  marges: 2.5
});

const getPreviewFontFamily = () => {
  if (exportSettings.police === 'serif') return 'Georgia, serif';
  if (exportSettings.police === 'sans-serif') return 'Arial, sans-serif';
  return 'Courier New, monospace';
};

// --- PARAMÈTRES ET WEBHOOKS ---
const isSettingsOpen = ref(false);

const settingsUrl = ref('https://n8n.clavier.dev/webhook-test/ecrivains');
const webhookUrl = ref('https://n8n.clavier.dev/webhook-test/ecrivains');

const settingsStructureUrl = ref('https://n8n.clavier.dev/webhook-test/structure-recit');
const webhookStructureUrl = ref('https://n8n.clavier.dev/webhook-test/structure-recit');

const settingsPersonnagesUrl = ref('https://n8n.clavier.dev/webhook-test/personnages');
const webhookPersonnagesUrl = ref('https://n8n.clavier.dev/webhook-test/personnages');

const settingsChapitresUrl = ref('https://n8n.clavier.dev/webhook-test/chapitres');
const webhookChapitresUrl = ref('https://n8n.clavier.dev/webhook-test/chapitres');

// --- OPENROUTER MODELS ---
const availableModels = ref([]);
const isLoadingModels = ref(false);
const settingsModel = ref('deepseek/deepseek-v4-flash');
const selectedModel = ref('deepseek/deepseek-v4-flash');
const modelSearchQuery = ref('');
const isDropdownOpen = ref(false);

const fetchOpenRouterModels = async () => {
  isLoadingModels.value = true;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (response.ok) {
      const data = await response.json();
      availableModels.value = data.data.sort((a, b) => {
        const nameA = (a.name || a.id).toLowerCase();
        const nameB = (b.name || b.id).toLowerCase();
        return nameA.localeCompare(nameB);
      });
      syncSearchQueryWithModel();
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des modèles OpenRouter:', err);
  } finally {
    isLoadingModels.value = false;
  }
};

onMounted(() => {
  // Load Webhooks URLs from LocalStorage
  const savedUrl = localStorage.getItem('webhookUrl');
  if (savedUrl) { webhookUrl.value = savedUrl; settingsUrl.value = savedUrl; }
  
  const savedStructureUrl = localStorage.getItem('webhookStructureUrl');
  if (savedStructureUrl) { webhookStructureUrl.value = savedStructureUrl; settingsStructureUrl.value = savedStructureUrl; }

  const savedPersonnagesUrl = localStorage.getItem('webhookPersonnagesUrl');
  if (savedPersonnagesUrl) { webhookPersonnagesUrl.value = savedPersonnagesUrl; settingsPersonnagesUrl.value = savedPersonnagesUrl; }

  const savedChapitresUrl = localStorage.getItem('webhookChapitresUrl');
  if (savedChapitresUrl) { webhookChapitresUrl.value = savedChapitresUrl; settingsChapitresUrl.value = savedChapitresUrl; }

  // Load Model from LocalStorage
  const savedModel = localStorage.getItem('selectedModel');
  if (savedModel) {
    selectedModel.value = savedModel;
    settingsModel.value = savedModel;
  }
  modelSearchQuery.value = settingsModel.value;

  // --- RÉCUPÉRATION DES DONNÉES DES ÉTAPES DEPUIS LE LOCALSTORAGE ---
  const savedStep = loadFromStorage('bookApp_currentStep', 1);
  currentStep.value = parseInt(savedStep, 10) || 1;

  const savedForm = loadFromStorage('bookApp_form', null);
  if (savedForm) Object.assign(form, savedForm);

  receivedStructure.value = loadFromStorage('bookApp_structure', '');
  receivedPersonnages.value = loadFromStorage('bookApp_personnages', '');
  
  const savedChapitres = loadFromStorage('bookApp_chapitres', []);
  if (Array.isArray(savedChapitres)) {
    chapitres.value = savedChapitres;
  }

  const savedExport = loadFromStorage('bookApp_exportSettings', null);
  if (savedExport) Object.assign(exportSettings, savedExport);
  // ------------------------------------------------------------------
  
  fetchOpenRouterModels();
});

// --- WATCHERS POUR SAUVEGARDER L'AVANCEMENT EN TEMPS RÉEL ---
watch(currentStep, (val) => localStorage.setItem('bookApp_currentStep', val), { deep: true });
watch(form, (val) => localStorage.setItem('bookApp_form', JSON.stringify(val)), { deep: true });
watch(receivedStructure, (val) => localStorage.setItem('bookApp_structure', val));
watch(receivedPersonnages, (val) => localStorage.setItem('bookApp_personnages', val));
watch(chapitres, (val) => localStorage.setItem('bookApp_chapitres', JSON.stringify(val)), { deep: true });
watch(exportSettings, (val) => localStorage.setItem('bookApp_exportSettings', JSON.stringify(val)), { deep: true });
// ------------------------------------------------------------


// Model Dropdown Logic
const filteredModels = computed(() => {
  if (!modelSearchQuery.value) return availableModels.value;
  const query = modelSearchQuery.value.toLowerCase();
  const selected = availableModels.value.find(m => m.id === settingsModel.value);
  if (selected && (selected.name === modelSearchQuery.value || selected.id === modelSearchQuery.value)) {
    return availableModels.value;
  }
  return availableModels.value.filter(model => {
    return (model.name && model.name.toLowerCase().includes(query)) ||
           (model.id && model.id.toLowerCase().includes(query));
  });
});

const syncSearchQueryWithModel = () => {
  const selected = availableModels.value.find(m => m.id === settingsModel.value);
  if (selected) {
    modelSearchQuery.value = selected.name || selected.id;
  } else {
    modelSearchQuery.value = settingsModel.value;
  }
};

const selectModel = (model) => {
  settingsModel.value = model.id;
  modelSearchQuery.value = model.name || model.id;
  isDropdownOpen.value = false;
};

const closeDropdown = () => {
  setTimeout(() => {
    isDropdownOpen.value = false;
    syncSearchQueryWithModel();
  }, 100);
};

watch(isSettingsOpen, (isOpen) => {
  if (isOpen) {
    syncSearchQueryWithModel();
  } else {
    settingsModel.value = selectedModel.value;
    settingsUrl.value = webhookUrl.value;
    settingsStructureUrl.value = webhookStructureUrl.value;
    settingsPersonnagesUrl.value = webhookPersonnagesUrl.value;
    settingsChapitresUrl.value = webhookChapitresUrl.value;
  }
});

const saveSettings = () => {
  webhookUrl.value = settingsUrl.value;
  webhookStructureUrl.value = settingsStructureUrl.value;
  webhookPersonnagesUrl.value = settingsPersonnagesUrl.value;
  webhookChapitresUrl.value = settingsChapitresUrl.value;
  selectedModel.value = settingsModel.value;
  
  localStorage.setItem('webhookUrl', webhookUrl.value);
  localStorage.setItem('webhookStructureUrl', webhookStructureUrl.value);
  localStorage.setItem('webhookPersonnagesUrl', webhookPersonnagesUrl.value);
  localStorage.setItem('webhookChapitresUrl', webhookChapitresUrl.value);
  localStorage.setItem('selectedModel', selectedModel.value);
  
  isSettingsOpen.value = false;
};

// --- API CALLS ---

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

// SOUMISSION ÉTAPE 1
const submitForm = async () => {
  isSubmitting.value = true;
  status.show = false;
  const payload = {
    pitch: form.pitch, nombre_de_chapitres: form.chapitres, contexte: { ...form.contexte }, style: { ...form.style }, modele: selectedModel.value
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

// SOUMISSION ÉTAPE 2
const submitStep2 = async (validate) => {
  isSubmitting2.value = true;
  isValidating.value = validate;
  status2.show = false;
  
  let urlToCall = validate ? webhookStructureUrl.value : webhookUrl.value;
  let payload;

  if (validate) {
    payload = {
      action: 'valider',
      structure: receivedStructure.value,
      modele: selectedModel.value
    };
  } else {
    payload = {
      pitch: form.pitch,
      nombre_de_chapitres: form.chapitres,
      contexte: { ...form.contexte },
      style: { ...form.style },
      modele: selectedModel.value,
      corrections: userFeedback.value,
      lastData: receivedStructure.value
    };
  }

  try {
    const response = await fetch(getProxiedUrl(urlToCall), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (response.ok) {
      if (validate) {
        // En passant à l'étape 3, on peut déjà pré-récupérer la réponse des personnages si renvoyée par le webhook de validation, ou via l'étape 3.
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

// SOUMISSION ÉTAPE 3
const submitStep3 = async (validate) => {
  isSubmitting3.value = true;
  isValidating3.value = validate;
  status3.show = false;
  
  let urlToCall = validate ? webhookPersonnagesUrl.value : webhookStructureUrl.value;
  let payload;

  if (validate) {
    payload = {
      action: 'valider',
      personnages: receivedPersonnages.value,
      modele: selectedModel.value
    };
  } else {
    payload = {
      action: 'valider',
      pitch: form.pitch,
      nombre_de_chapitres: form.chapitres,
      contexte: { ...form.contexte },
      style: { ...form.style },
      structure: receivedStructure.value,
      modele: selectedModel.value,
      corrections: userFeedbackPersonnages.value,
      lastData: receivedPersonnages.value
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

// ACTUALISER CHAPITRES ÉTAPE 4
const fetchChapitres = async () => {
  try {
    // Si l'URL attend un GET
    const response = await fetch(getProxiedUrl(webhookChapitresUrl.value));
    if(response.ok) {
      const data = await response.json();
      // On s'attend à un tableau de chapitres: [{ numero, titre, contenu }]
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

// GÉNÉRER PDF ÉTAPE 5
const genererPdf = () => {
  alert(`La fonctionnalité de génération PDF se lancera ici, avec :\n- Police : ${exportSettings.police}\n- Taille : ${exportSettings.taille}pt\n- Marges : ${exportSettings.marges}cm\n\n(Peut être implémenté via jsPDF ou une API backend)`);
};
</script>

<style>
/* Animations douces de transition */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
