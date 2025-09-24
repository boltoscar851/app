/*
  # Insert default activities for couples

  This migration adds a variety of romantic, fun, and surprise activities
  that couples can choose from in the activity roulette.
*/

INSERT INTO activities (title, description, category, difficulty, duration, is_surprise) VALUES
-- Romantic Activities
('Cena a la luz de las velas', 'Preparen una cena romántica en casa con velas y música suave', 'romantic', 'easy', '2 horas', false),
('Baño relajante juntos', 'Disfruten de un baño con sales aromáticas y pétalos de rosa', 'romantic', 'easy', '1 hora', false),
('Masajes mutuos', 'Dense masajes relajantes el uno al otro', 'romantic', 'easy', '45 min', false),
('Picnic bajo las estrellas', 'Organicen un picnic nocturno para ver las estrellas', 'romantic', 'medium', '3 horas', false),
('Escribir cartas de amor', 'Escriban cartas de amor para leer en el futuro', 'romantic', 'easy', '30 min', false),
('Recrear su primera cita', 'Vuelvan al lugar de su primera cita o recréenla en casa', 'romantic', 'medium', '2 horas', false),
('Sesión de fotos romántica', 'Tómense fotos románticas en casa o en un lugar especial', 'romantic', 'easy', '1 hora', false),
('Cocinar juntos', 'Preparen su comida favorita trabajando en equipo', 'romantic', 'medium', '1.5 horas', false),

-- Fun Activities
('Maratón de películas', 'Vean sus películas favoritas con palomitas y snacks', 'fun', 'easy', '4 horas', false),
('Karaoke en casa', 'Canten sus canciones favoritas juntos', 'fun', 'easy', '1 hora', false),
('Juegos de mesa', 'Jueguen sus juegos de mesa favoritos', 'fun', 'easy', '2 horas', false),
('Competencia de baile', 'Tengan una competencia de baile con su música favorita', 'fun', 'medium', '45 min', false),
('Noche de videojuegos', 'Jueguen videojuegos cooperativos o competitivos', 'fun', 'easy', '2 horas', false),
('Crear arte juntos', 'Hagan una pintura o manualidad trabajando juntos', 'fun', 'medium', '2 horas', false),
('Explorar la ciudad', 'Visiten un lugar nuevo en su ciudad como turistas', 'fun', 'medium', '3 horas', false),
('Clase de baile online', 'Aprendan un nuevo baile siguiendo tutoriales', 'fun', 'medium', '1 hora', false),

-- Challenge Activities
('Reto de 24 horas sin teléfono', 'Pasen 24 horas sin usar sus teléfonos, solo disfrutándose', 'challenge', 'hard', '24 horas', false),
('Aprender algo nuevo juntos', 'Elijan una habilidad nueva para aprender juntos', 'challenge', 'medium', '2 horas', false),
('Ejercicio en pareja', 'Hagan una rutina de ejercicio diseñada para parejas', 'challenge', 'medium', '45 min', false),
('Reto culinario', 'Cocinen un plato que nunca han hecho antes', 'challenge', 'medium', '2 horas', false),
('Meditación en pareja', 'Practiquen meditación juntos por 30 minutos', 'challenge', 'easy', '30 min', false),
('Planificar el futuro', 'Dediquen tiempo a planificar sus metas como pareja', 'challenge', 'medium', '1.5 horas', false),

-- Surprise Activities
('Sorpresa misteriosa', 'Uno de los dos prepara una sorpresa secreta para el otro', 'surprise', 'medium', '2 horas', true),
('Regalo hecho a mano', 'Creen un regalo especial hecho por ustedes mismos', 'surprise', 'medium', '3 horas', true),
('Aventura sorpresa', 'Planeen una mini aventura sin decirle al otro a dónde van', 'surprise', 'hard', '4 horas', true),
('Desayuno sorpresa', 'Preparen el desayuno favorito del otro como sorpresa', 'surprise', 'easy', '45 min', true),
('Playlist sorpresa', 'Creen una playlist especial con canciones que representen su amor', 'surprise', 'easy', '30 min', true),
('Carta del futuro', 'Escriban una carta para abrir en su próximo aniversario', 'surprise', 'easy', '30 min', true);