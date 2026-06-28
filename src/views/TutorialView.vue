<template>
  <div class="bg-gray-100 min-h-screen p-4 md:p-8 font-sans">
    <div class="max-w-4xl mx-auto">

      <!-- HEADER -->
      <div class="flex items-center justify-between mb-6">
        <router-link to="/" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Retour à l'application
        </router-link>
      </div>

      <!-- CONTENT -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-indigo-600 p-6 text-white">
          <h1 class="text-3xl font-bold flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Documentation & Tutoriel
          </h1>
        </div>

        <div class="p-8 prose prose-indigo max-w-none prose-h1:text-indigo-800 prose-h2:text-indigo-700 prose-a:text-indigo-600">
          <div v-html="renderedMarkdown"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import tutorialMarkdown from '../docs/tutorial.md?raw';

const renderedMarkdown = ref('');

onMounted(() => {
  renderedMarkdown.value = marked.parse(tutorialMarkdown);
});
</script>

<style>
/* Some basic styling for the markdown content since we don't have @tailwindcss/typography installed by default */
.prose h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1.5rem; color: #3730a3; }
.prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #4338ca; border-bottom: 2px solid #e0e7ff; padding-bottom: 0.5rem; }
.prose p { margin-bottom: 1rem; line-height: 1.75; color: #374151; }
.prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; }
.prose li { margin-bottom: 0.5rem; }
.prose strong { font-weight: 600; color: #111827; }
.prose hr { margin-top: 2rem; margin-bottom: 2rem; border-color: #e5e7eb; }
.prose em { font-style: italic; color: #6b7280; }
</style>
