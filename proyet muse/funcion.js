// ==========================================
// CONFIGURACIÓN DE ELEMENTOS Y SELECTORES
// ==========================================
const playBtn = document.getElementById('playBtn');
const progressBar = document.querySelector('.progress-bar');
const currentTimeStamp = document.querySelector('.time-stamp:first-child');
const totalTimeStamp = document.querySelector('.time-stamp:last-child');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const mainAudio = document.getElementById('mainAudio');

const playerImg = document.querySelector('.album-cover img');
const playerTitle = document.querySelector('.song-title');
const playerArtist = document.querySelector('.song-artist');
const songCards = document.querySelectorAll('.song-card');

// Selectores para menús y biblioteca
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const openLibraryBtn = document.getElementById('openLibraryBtn');
const sidebarLibrary = document.getElementById('sidebarLibrary');
const closeLibraryBtn = document.getElementById('closeLibraryBtn');
const librarySongsList = document.getElementById('librarySongsList');

// Estados del reproductor
let isPlaying = false;
let isLoopActive = false; 

// Set para evitar duplicar canciones en la biblioteca
const savedSongs = new Set();

// ==========================================
// FUNCIÓN PARA DAR FORMATO DE TIEMPO (0:00)
// ==========================================
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==========================================
// SINCRONIZACIÓN REAL CON EL AUDIO NATIVO
// ==========================================
if (mainAudio) {
    // 1. Al cambiar de canción y cargar metadatos
    mainAudio.addEventListener('loadedmetadata', () => {
        if (totalTimeStamp) {
            totalTimeStamp.innerText = formatTime(mainAudio.duration);
        }
    });

    // 2. Mientras avanza la canción real
    mainAudio.addEventListener('timeupdate', () => {
        if (!mainAudio.duration) return;
        if (currentTimeStamp) {
            currentTimeStamp.innerText = formatTime(mainAudio.currentTime);
        }
        if (progressBar) {
            const progressPercentage = (mainAudio.currentTime / mainAudio.duration) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
    });

    // 3. Al terminar la canción
    mainAudio.addEventListener('ended', () => {
        if (isLoopActive) {
            mainAudio.currentTime = 0;
            mainAudio.play().catch(err => console.log("Error al repetir canción:", err));
        } else {
            isPlaying = false;
            if (playBtn) playBtn.innerText = '▶';
        }
    });
}

// ==========================================
// CONTROL DEL BOTÓN PLAY / PAUSE
// ==========================================
if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (!mainAudio || !mainAudio.src || mainAudio.src === "") {
            alert("¡Elige una canción del carrusel primero! 🎵");
            return;
        }

        if (!isPlaying) {
            playBtn.innerText = '⏸';
            isPlaying = true;
            mainAudio.play().catch(error => console.log("Esperando interacción del usuario...")); 
        } else {
            playBtn.innerText = '▶';
            isPlaying = false;
            mainAudio.pause(); 
        }
    });
}

// ==========================================
// BOTÓN RETROCEDER (REINICIAR CANCIÓN)
// ==========================================
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (mainAudio && mainAudio.src) {
            mainAudio.currentTime = 0;
            if (currentTimeStamp) currentTimeStamp.innerText = "0:00";
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.transition = 'width 0.2s linear';
                }, 50);
            }
        }
    });
}

// ==========================================
// BOTÓN ADELANTAR (SALTAR AL FINAL)
// ==========================================
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (mainAudio && mainAudio.src && !isNaN(mainAudio.duration)) {
            mainAudio.currentTime = mainAudio.duration - 1; 
        }
    });
}

// ==========================================
// CÓDIGO DE MENÚS LATERALES (Hamburguesa y Biblioteca)
// ==========================================
if (menuBtn && sidebar && sidebarOverlay && sidebarLibrary) {
    // 1. Abrir o cerrar menú hamburguesa
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        sidebar.classList.toggle('active');
        
        if (sidebar.classList.contains('active') || sidebarLibrary.classList.contains('active')) {
            sidebarOverlay.classList.add('active');
        } else {
            sidebarOverlay.classList.remove('active');
        }
    });

    // 2. Abrir biblioteca desde el enlace del menú
    if (openLibraryBtn) {
        openLibraryBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            sidebarLibrary.classList.add('active');
            
            // Cerramos el menú de la derecha para limpiar la vista
            menuBtn.classList.remove('active');
            sidebar.classList.remove('active');
        });
    }

    // 3. Botón para volver (cerrar biblioteca)
    if (closeLibraryBtn) {
        closeLibraryBtn.addEventListener('click', () => {
            sidebarLibrary.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // 4. Cerrar TODO al tocar el overlay (el fondo oscuro)
    sidebarOverlay.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        sidebar.classList.remove('active');
        sidebarLibrary.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
}

// ==========================================
// SELECCIÓN DE CANCIONES Y AGREGADO AUTOMÁTICO A LA BIBLIOTECA
// ==========================================
songCards.forEach(card => {
    card.addEventListener('click', () => {
        const title = card.getAttribute('data-title');
        const artist = card.getAttribute('data-artist');
        const imgSrc = card.getAttribute('data-img');
        const audioSrc = card.getAttribute('data-audio'); 

        // Actualizar datos en el reproductor inferior
        if (playerTitle) playerTitle.innerText = title;
        if (playerArtist) playerArtist.innerText = artist;
        if (playerImg) playerImg.src = imgSrc; 

        if (audioSrc && mainAudio) {
            mainAudio.src = audioSrc; 
            if (currentTimeStamp) currentTimeStamp.innerText = "0:00";
            if (progressBar) progressBar.style.width = '0%';

            mainAudio.play()
                .then(() => {
                    if (playBtn) playBtn.innerText = '⏸';
                    isPlaying = true;
                })
                .catch(err => console.error("Error al reproducir el archivo. Verifica la ruta: ", err));
        }

        // AGREGAR A LA BIBLIOTECA SI NO EXISTE
        if (librarySongsList && !savedSongs.has(audioSrc)) {
            savedSongs.add(audioSrc);

            // Eliminar el mensaje de "Biblioteca vacía" si existe
            const emptyMsg = librarySongsList.querySelector('.empty-library-msg');
            if (emptyMsg) emptyMsg.remove();

            // Crear fila compacta para la biblioteca
            const libraryItem = document.createElement('div');
            libraryItem.classList.add('library-item');
            libraryItem.innerHTML = `
                <img src="${imgSrc}" alt="Portada">
                <div class="library-item-details">
                    <p class="library-item-title">${title}</p>
                    <p class="library-item-artist">${artist}</p>
                </div>
            `;

            // Hacer que sea reproducible desde la biblioteca
            libraryItem.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita conflictos de clics
                card.click(); // Dispara el evento original de la tarjeta
            });

            librarySongsList.appendChild(libraryItem);
        }
    });
});

// ==========================================
// CONTROL DE LA VENTANA FLOTANTE (MODAL)
// ==========================================
const loginBtn = document.querySelector('.btn-login'); 
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');

if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
}

if (closeModal && loginModal) {
    closeModal.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });
}

if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
}

// ==========================================
// LÓGICA DE DESPLAZAMIENTO DEL CARRUSEL
// ==========================================
const carousel = document.getElementById('songsCarousel');
const prevCardBtn = document.getElementById('prevCardBtn');
const nextCardBtn = document.getElementById('nextCardBtn');
const scrollAmount = 360; 

if (nextCardBtn && carousel) {
    nextCardBtn.addEventListener('click', () => {
        carousel.scrollLeft += scrollAmount;
    });
}

if (prevCardBtn && carousel) {
    prevCardBtn.addEventListener('click', () => {
        carousel.scrollLeft -= scrollAmount;
    });
}

// ==========================================
// FILTRO DE BÚSQUEDA EN TIEMPO REAL
// ==========================================
const searchInput = document.getElementById('searchInput');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.toLowerCase().trim();

        songCards.forEach(card => {
            const title = card.getAttribute('data-title') ? card.getAttribute('data-title').toLowerCase() : '';
            const artist = card.getAttribute('data-artist') ? card.getAttribute('data-artist').toLowerCase() : '';

            if (title.includes(searchText) || artist.includes(searchText)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ==========================================
// REPRODUCCIÓN ALEATORIA (SHUFFLE)
// ==========================================
const shuffleBtn = document.getElementById('shuffleBtn');

if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
        const visibleCards = Array.from(songCards).filter(card => card.style.display !== 'none');

        if (visibleCards.length === 0) return;

        const randomIndex = Math.floor(Math.random() * visibleCards.length);
        const randomCard = visibleCards[randomIndex];

        randomCard.click();

        randomCard.style.boxShadow = '0 0 15px rgba(255, 0, 127, 0.4)';
        setTimeout(() => {
            randomCard.style.boxShadow = 'none';
        }, 600);
    });
}

// ==========================================
// LÓGICA DEL BOTÓN DE BUCLE (LOOP)
// ==========================================
const loopBtn = document.getElementById('loopBtn');

if (loopBtn) {
    loopBtn.addEventListener('click', () => {
        isLoopActive = !isLoopActive; 
        loopBtn.classList.toggle('active', isLoopActive);
    });
}