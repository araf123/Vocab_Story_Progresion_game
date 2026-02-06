document.addEventListener('DOMContentLoaded', () => {
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Elements
    const dashboardView = document.getElementById('dashboard-view');
    const adventureView = document.getElementById('adventure-view');
    const synopsisModal = document.getElementById('synopsis-modal');
    const storyText = document.getElementById('story-text');
    const choiceContainer = document.getElementById('choice-container');
    const foundCount = document.getElementById('found-count');
    const totalCount = document.getElementById('total-count');
    const vocabTooltip = document.getElementById('vocab-tooltip');
    const tooltipContent = document.getElementById('tooltip-content');
    const customStoryGrid = document.getElementById('custom-story-grid');

    const modalTitle = document.getElementById('modal-title');
    const modalSynopsis = document.getElementById('modal-synopsis');
    const activeStoryTitle = document.getElementById('active-story-title');

    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const modalStartBtn = document.getElementById('modal-start-btn');
    const backToLibraryBtn = document.getElementById('back-to-library');

    // Global State
    let wordsFound = 0;
    let totalWords = 0;
    let activeStoryNodes = {};

    const DEFAULT_STORIES = {
        lexicon_academy: {
            id: 'lexicon_academy',
            title: 'Lexicon Academy',
            synopsis: 'Embark on your journey at the prestigious Lexicon Academy. Uncover the secrets of ancient linguistics and master the power of words to shape your destiny.',
            thumbnail: '',
            data: {
                start: {
                    text: 'You stand before the [towering|extremely tall] gates of Lexicon Academy. A [mist|thin fog] clings to the ivy, obscuring the path ahead. The [ominous|threatening] silence is broken only by the distant [peal|loud ringing] of a bell. To enter is to [relinquish|give up] your old life and embrace the [profundity|deep insight] of the Word.',
                    choices: [
                        { text: 'Approach the Great Gates', next: 'gates' },
                        { text: 'Investigate the Ivy', next: 'ivy' },
                        { text: 'Listen to the Bell', next: 'bell' }
                    ]
                },
                gates: {
                    text: 'The gates are [unyielding|impossible to move]. You notice a [cryptic|mysterious] inscription carved into the cold stone. It speaks of a [key|crucial element] hidden in plain sight. Perhaps the [answers|solutions] lie within the [annals|historical records] of the school.',
                    choices: [
                        { text: 'Search for a hidden mechanism', next: 'start' },
                        { text: 'Return to the perimeter', next: 'start' }
                    ]
                },
                ivy: {
                    text: 'The ivy is thick and [verdant|bright green]. As you pull back the leaves, you find a [concealed|hidden] door. It appears to be [ancient|very old], its wood [weathered|worn by the elements] but strong.',
                    choices: [
                        { text: 'Try the door', next: 'start' },
                        { text: 'Keep exploring the wall', next: 'start' }
                    ]
                },
                bell: {
                    text: 'The sound of the bell is [resonant|deep and full]. It echoes through your very [soul|innermost being]. You feel a [compulsion|strong urge] to follow the sound toward the [spire|pointed roof] in the distance.',
                    choices: [
                        { text: 'Follow the sound', next: 'start' },
                        { text: 'Ignore it and stay put', next: 'start' }
                    ]
                }
            }
        },
        the_library: {
            id: 'the_library',
            title: 'The Library',
            synopsis: 'Explore the endless corridors of the Great Library. Find forgotten scrolls and expand your vocabulary through ancient texts.',
            thumbnail: '',
            data: {
                start: {
                    text: 'Rows of [dusty|covered in fine powder] tomes tower around you. A [fragile|easily broken] manuscript glows faintly beneath the lamp.',
                    choices: [
                        { text: 'Read the glowing manuscript', next: 'reading_room' },
                        { text: 'Return to the entrance hall', next: 'start' }
                    ]
                },
                reading_room: {
                    text: 'In the quiet reading room, an [annotated|commented with notes] lexicon explains a [nuance|subtle difference] you had long misunderstood.',
                    choices: [{ text: 'Head back to the stacks', next: 'start' }]
                }
            }
        },
        the_science_lab: {
            id: 'the_science_lab',
            title: 'The Science Lab',
            synopsis: 'Master technical terminology and scientific discourse in the state-of-the-art research facility of the Lexicon Academy.',
            thumbnail: '',
            data: {
                start: {
                    text: 'Beakers [simmer|heat gently] on a rack while a [meticulous|very careful] researcher records each observation.',
                    choices: [
                        { text: 'Observe the experiment', next: 'experiment' },
                        { text: 'Review the notes', next: 'notes' }
                    ]
                },
                experiment: {
                    text: 'The reaction changes [abruptly|suddenly], revealing a [volatile|likely to change quickly] compound.',
                    choices: [{ text: 'Back to the lab bench', next: 'start' }]
                },
                notes: {
                    text: 'The notes are [precise|very exact] and [empirical|based on observation] in tone.',
                    choices: [{ text: 'Back to the lab bench', next: 'start' }]
                }
            }
        },
        training_grounds: {
            id: 'training_grounds',
            title: 'The Training Grounds',
            synopsis: "Sharpen your skills with rapid-fire exercises and competitive word-building challenges against the Academy's elite.",
            thumbnail: '',
            data: {
                start: {
                    text: 'Instructors call out [rapid|very fast] prompts while students answer with [coherent|logically connected] definitions.',
                    choices: [
                        { text: 'Take the timed drill', next: 'drill' },
                        { text: 'Review fundamentals', next: 'review' }
                    ]
                },
                drill: {
                    text: 'Your responses grow more [succinct|brief and clear] as confidence builds.',
                    choices: [{ text: 'Reset the challenge', next: 'start' }]
                },
                review: {
                    text: 'A mentor offers [constructive|helpfully critical] feedback on each attempt.',
                    choices: [{ text: 'Return to training', next: 'start' }]
                }
            }
        }
    };

    const STATIC_STORY_IDS = new Set(Object.keys(DEFAULT_STORIES));

    function safeParseStories() {
        try {
            const parsed = JSON.parse(localStorage.getItem('admin_stories') || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
            const adminStories = JSON.parse(adminStoriesRaw);
            
            Object.values(adminStories).forEach(story => {
                if (!story || typeof story !== 'object' || !story.id || !story.data || typeof story.data !== 'object') {
                    return;
                }

                const safeTitle = escapeHtml(story.title || 'Untitled Adventure');
                const synopsis = typeof story.synopsis === 'string' ? story.synopsis : 'A custom story.';
                const safeSynopsis = escapeHtml(synopsis);
                const card = document.createElement('div');
                card.className = "story-card bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-secondary transition-all duration-300 group cursor-pointer";
                card.setAttribute('data-title', story.title || 'Untitled Adventure');
                card.setAttribute('data-synopsis', synopsis);
                card.setAttribute('data-story-id', story.id);
                
                const thumbHtml = story.thumbnail 
                    ? `<img src="${story.thumbnail}" class="w-full h-full object-cover rounded-xl" alt="${safeTitle}">`
                    : `<span class="text-xs font-bold text-secondary uppercase tracking-widest">Architect Story</span>`;

                card.innerHTML = `
                    <div class="aspect-video bg-[#18181b] rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                        ${thumbHtml}
                    </div>
                    <h3 class="text-xl font-bold mb-2">${safeTitle}</h3>
                    <p class="text-secondary text-sm leading-relaxed mb-6 flex-1">${safeSynopsis.substring(0, 100)}...</p>
                    <button class="start-btn w-full py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-primary hover:text-background transition-all">Start Adventure</button>
                `;

                customStoryGrid.appendChild(card);
                bindCardListeners(card, story.data);
            });
        } catch (e) {
            return {};
        }
    }

    function ensureDefaultStoriesSeeded() {
        const existing = safeParseStories();
        let changed = false;

        Object.entries(DEFAULT_STORIES).forEach(([id, story]) => {
            if (!existing[id]) {
                existing[id] = story;
                changed = true;
            }
        });

        if (changed) {
            localStorage.setItem('admin_stories', JSON.stringify(existing));
        }
    }

    function getAllStories() {
        return safeParseStories();
    }

    function applyStoryMetaToCard(card, story) {
        card.setAttribute('data-title', story.title || 'Untitled Adventure');
        card.setAttribute('data-synopsis', story.synopsis || 'A custom story.');
        card.setAttribute('data-story-id', story.id);

        const titleEl = card.querySelector('h3');
        if (titleEl) titleEl.textContent = story.title || 'Untitled Adventure';

        const synopsisEl = card.querySelector('p.text-secondary');
        if (synopsisEl) {
            const synopsis = story.synopsis || 'A custom story.';
            synopsisEl.textContent = synopsis.length > 100 ? `${synopsis.slice(0, 100)}...` : synopsis;
        }
    }

    function clearDynamicStoryCards() {
        customStoryGrid.querySelectorAll('[data-origin="dynamic"]').forEach(card => card.remove());
    }

    // --- Admin Portal Integration ---
    function initStories() {
        ensureDefaultStoriesSeeded();
        const allStories = getAllStories();

        clearDynamicStoryCards();

        document.querySelectorAll('.story-card[data-story-id]').forEach(card => {
            const storyId = card.getAttribute('data-story-id');
            const story = allStories[storyId];
            if (!story || !story.data || typeof story.data !== 'object') return;

            applyStoryMetaToCard(card, story);
            bindCardListeners(card, story.data);
        });


        const titleEl = card.querySelector('h3');
        if (titleEl) titleEl.textContent = story.title || 'Untitled Adventure';

        const synopsisEl = card.querySelector('p.text-secondary');
        if (synopsisEl) {
            const synopsis = story.synopsis || 'A custom story.';
            synopsisEl.textContent = synopsis.length > 100 ? `${synopsis.slice(0, 100)}...` : synopsis;
        }
    }

    // --- Admin Portal Integration ---
    function initStories() {
        ensureDefaultStoriesSeeded();
        const allStories = getAllStories();

        document.querySelectorAll('.story-card[data-story-id]').forEach(card => {
            const storyId = card.getAttribute('data-story-id');
            const story = allStories[storyId];
            if (!story || !story.data || typeof story.data !== 'object') return;

            applyStoryMetaToCard(card, story);
            bindCardListeners(card, story.data);
        });

        // Only render non-static stories in the custom grid to avoid duplicates.
        Object.values(allStories).forEach(story => {
            if (!story || typeof story !== 'object' || !story.id || !story.data || typeof story.data !== 'object') {
                return;
            }
            if (STATIC_STORY_IDS.has(story.id)) return;

            const safeTitle = escapeHtml(story.title || 'Untitled Adventure');
            const synopsis = typeof story.synopsis === 'string' ? story.synopsis : 'A custom story.';
            const safeSynopsis = escapeHtml(synopsis);
            const card = document.createElement('div');
            card.className = 'story-card bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-secondary transition-all duration-300 group cursor-pointer';

            const thumbHtml = story.thumbnail
                ? `<img src="${story.thumbnail}" class="w-full h-full object-cover rounded-xl" alt="${safeTitle}">`
                : '<span class="text-xs font-bold text-secondary uppercase tracking-widest">Architect Story</span>';

            card.innerHTML = `
                <div class="aspect-video bg-[#18181b] rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                    ${thumbHtml}
                </div>
                <h3 class="text-xl font-bold mb-2">${safeTitle}</h3>
                <p class="text-secondary text-sm leading-relaxed mb-6 flex-1">${safeSynopsis.substring(0, 100)}...</p>
                <button class="start-btn w-full py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-primary hover:text-background transition-all">Start Adventure</button>
            `;

            applyStoryMetaToCard(card, story);
            customStoryGrid.appendChild(card);
            bindCardListeners(card, story.data);
        });
    }


        document.querySelectorAll('.story-card[data-story-id]').forEach(card => {
            const storyId = card.getAttribute('data-story-id');
            const story = allStories[storyId];
            if (!story || !story.data || typeof story.data !== 'object') return;

            applyStoryMetaToCard(card, story);
            bindCardListeners(card, story.data);
        });

        // Only render non-static stories in the custom grid to avoid duplicates.
        Object.values(allStories).forEach(story => {
            if (!story || typeof story !== 'object' || !story.id || !story.data || typeof story.data !== 'object') {
                return;
            }
            if (STATIC_STORY_IDS.has(story.id)) return;

            const safeTitle = escapeHtml(story.title || 'Untitled Adventure');
            const synopsis = typeof story.synopsis === 'string' ? story.synopsis : 'A custom story.';
            const safeSynopsis = escapeHtml(synopsis);
            const card = document.createElement('div');
            card.className = 'story-card bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-secondary transition-all duration-300 group cursor-pointer';
            card.dataset.origin = 'dynamic';

            const thumbHtml = story.thumbnail
                ? `<img src="${story.thumbnail}" class="w-full h-full object-cover rounded-xl" alt="${safeTitle}">`
                : '<span class="text-xs font-bold text-secondary uppercase tracking-widest">Architect Story</span>';

            card.innerHTML = `
                <div class="aspect-video bg-[#18181b] rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                    ${thumbHtml}
                </div>
                <h3 class="text-xl font-bold mb-2">${safeTitle}</h3>
                <p class="text-secondary text-sm leading-relaxed mb-6 flex-1">${safeSynopsis.substring(0, 100)}...</p>
                <button class="start-btn w-full py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-primary hover:text-background transition-all">Start Adventure</button>
            `;

            applyStoryMetaToCard(card, story);
            customStoryGrid.appendChild(card);
            bindCardListeners(card, story.data);
        });
    }

    // --- Branching Logic & Reading Engine ---
    function loadPath(pathKey) {
        if (pathKey === 'start' && !activeStoryNodes.start) {
            const firstAvailableNode = Object.keys(activeStoryNodes)[0];
            if (firstAvailableNode) pathKey = firstAvailableNode;
        }

        if (!activeStoryNodes[pathKey]) {
            console.warn(`Path not found: ${pathKey}.`);
            return;
        }

        const data = activeStoryNodes[pathKey];
        if (!data || typeof data.text === 'undefined') {
            console.error(`Node ${pathKey} has no text content.`);
            return;
        }

        wordsFound = 0;
        totalWords = 0;
        storyText.innerHTML = '';

        choiceContainer.classList.add('hidden');
        choiceContainer.classList.remove('opacity-100');
        choiceContainer.classList.add('opacity-0');
        choiceContainer.innerHTML = '';

        renderParagraph(data.text);

        
        (data.choices || []).forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'w-full text-left bg-card border border-border p-4 rounded-xl text-secondary hover:border-white hover:text-primary transition-all duration-300 group flex justify-between items-center';
            btn.innerHTML = `
                <span>${escapeHtml(choice.text || 'Continue')}</span>
                <svg class="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            `;
            btn.onclick = () => loadPath(choice.next || 'start');
            choiceContainer.appendChild(btn);
        });
    }

    function renderParagraph(text) {
        const regex = /\[(.*?)\|(.*?)\]/g;
        const html = String(text || '').replace(regex, (match, word, definition) => {
            return `<span class="hidden-word border-b border-dashed border-zinc-600 cursor-pointer hover:text-white transition-colors" data-def="${escapeHtml(definition)}">${escapeHtml(word)}</span>`;
        });

        storyText.innerHTML = `<p class="animate-in fade-in slide-in-from-bottom-4 duration-1000">${html}</p>`;

        const words = storyText.querySelectorAll('.hidden-word');
        totalWords = words.length;
        totalCount.innerText = totalWords;
        foundCount.innerText = wordsFound;

        if (totalWords === 0) {
            unlockChoices();
        }
    }

    // --- Discovery & Tooltip ---
    storyText.addEventListener('click', (e) => {
        const wordEl = e.target.closest('.hidden-word');
        if (!wordEl) {
            hideTooltip();
            return;
        }

        e.stopPropagation();
        const definition = wordEl.getAttribute('data-def');
        showTooltip(wordEl, definition);

        if (!wordEl.classList.contains('text-white')) {
            wordEl.classList.add('discovered', 'text-white', 'border-solid', 'border-white');
            wordEl.classList.remove('border-dashed', 'border-zinc-600');

            wordsFound++;
            foundCount.innerText = wordsFound;

            if (wordsFound === totalWords) {
                unlockChoices();
            }
        }
    });

    function unlockChoices() {
        choiceContainer.classList.remove('hidden');
        setTimeout(() => {
            choiceContainer.classList.remove('opacity-0');
            choiceContainer.classList.add('opacity-100');
        }, 100);
    }

    function showTooltip(targetEl, text) {
        tooltipContent.innerText = text;
        vocabTooltip.classList.remove('hidden');

        const wordRect = targetEl.getBoundingClientRect();
        const tooltipWidth = vocabTooltip.offsetWidth;
        const tooltipHeight = vocabTooltip.offsetHeight;

        let top = wordRect.top - tooltipHeight - 10 + window.scrollY;
        let left = wordRect.left + (wordRect.width / 2) - (tooltipWidth / 2);

        if (top < window.scrollY + 10) {
            top = wordRect.bottom + 10 + window.scrollY;
            vocabTooltip.querySelector('.absolute').classList.add('hidden');
        } else {
            vocabTooltip.querySelector('.absolute').classList.remove('hidden');
        }

        if (left + tooltipWidth > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth - 10;
        }
        if (left < 10) {
            left = 10;
        }

        vocabTooltip.style.top = `${top}px`;
        vocabTooltip.style.left = `${left}px`;
        vocabTooltip.classList.add('animate-in', 'slide-in-from-bottom-2');
    }

    function hideTooltip() {
        vocabTooltip.classList.add('hidden');
    }

    document.addEventListener('click', (e) => {
        if (!vocabTooltip.contains(e.target)) hideTooltip();
    });

    // --- View Switching ---
    function showView(viewId, title = '', storyNodes = null) {
        if (viewId === 'adventure') {
            activeStoryNodes = storyNodes || {};
            dashboardView.classList.add('opacity-0');
            setTimeout(() => {
                dashboardView.classList.add('hidden');
                adventureView.classList.remove('hidden');
                activeStoryTitle.innerText = title;
                loadPath('start');
                window.scrollTo(0, 0);
            }, 300);
        } else {
            adventureView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            setTimeout(() => dashboardView.classList.remove('opacity-0'), 10);
        }
    }

    function openModal(title, synopsis, storyNodes) {
        modalTitle.innerText = title;
        modalSynopsis.innerText = synopsis;
        synopsisModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        modalStartBtn.onclick = () => {
            closeModal();
            showView('adventure', title, storyNodes);
        };
    }

    function closeModal() {
        synopsisModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function bindCardListeners(card, storyNodes) {
        card._storyNodes = storyNodes;
        if (card.dataset.listenersBound === 'true') return;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.start-btn')) return;
            openModal(card.getAttribute('data-title'), card.getAttribute('data-synopsis'), card._storyNodes);
        });

        const startBtn = card.querySelector('.start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showView('adventure', card.getAttribute('data-title'), card._storyNodes);
            });
        }

        card.dataset.listenersBound = 'true';
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    backToLibraryBtn.addEventListener('click', () => showView('dashboard'));
    synopsisModal.addEventListener('click', (e) => { if (e.target === synopsisModal) closeModal(); });

    window.addEventListener('focus', initStories);
    window.addEventListener('storage', (e) => {
        if (e.key === 'admin_stories') initStories();
    });

    initStories();
    initStories();
    initAdminStories();
});
