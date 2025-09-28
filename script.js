
        let loader;
        
        // Wait for components to load
        document.addEventListener('DOMContentLoaded', function() {
            loader = document.getElementById('mainLoader');
            
            // Listen to loading events
            loader.addEventListener('loadingStarted', (e) => {
                console.log('Loading started:', e.detail);
            });
            
            loader.addEventListener('loadingCompleted', () => {
                console.log('Loading completed!');
            });
        });
        
        function testLoading() {
            if (loader) {
                loader.startLoading(3000); // 3 seconds
            }
        }
        
        function testCustomLoading() {
            if (loader) {
                // Set custom messages
                loader.setMessages([
                    "Cargando juego épico...",
                    "Preparando aventura...",
                    "Configurando poderes...",
                    "¡Casi listo para la acción!"
                ]);
                loader.startLoading(4000);
            }
        }
        
        function stopLoading() {
            if (loader) {
                loader.stopLoading();
            }
        }
    