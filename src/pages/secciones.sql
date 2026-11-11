-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Servidor: db5020055703.hosting-data.io
-- Tiempo de generación: 01-09-2026 a las 17:18:29
-- Versión del servidor: 8.0.36
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dbs15462976`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secciones`
--

CREATE TABLE `secciones` (
  `id` int NOT NULL,
  `arabigo` int NOT NULL,
  `romano` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `slogan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color_principal` varchar(7) COLLATE utf8mb4_general_ci DEFAULT '#3EAEF4',
  `color_secundario` varchar(7) COLLATE utf8mb4_general_ci DEFAULT '#0A0F1E',
  `logo_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `banner_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` tinyint DEFAULT '2',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `secciones`
--

INSERT INTO `secciones` (`id`, `arabigo`, `romano`, `nombre`, `slogan`, `direccion`, `telefono`, `correo`, `color_principal`, `color_secundario`, `logo_url`, `banner_url`, `status`, `created_at`) VALUES
(1, 1, 'I', 'Puebla', '¡Unidos por la Dignidad!', 'C. 4 Sur 1310, El Carmen, C.P. 72530, Puebla, Puebla', NULL, NULL, '#4A90D9', '#0A0F1E', '/images/seccionesLogo/logo1.jpg', '/images/seccionesBanner/banner1.png', 2, '2026-08-05 15:31:08'),
(2, 2, 'II', 'Nuevo León', '¡Fuerza y Trabajo Digno!', 'Av. Abraham Lincoln 3633 Pte., Mitras Norte, C.P. 64320, Monterrey, Nuevo León', NULL, NULL, '#5B86E5', '#0A0F1E', '/images/seccionesLogo/logo2.jpg', '/images/seccionesBanner/banner2.jpg', 2, '2026-08-05 15:31:08'),
(3, 3, 'III', 'Jalisco', '¡Siempre Adelante, Siempre Unidos!', 'Av. Río Nilo 470, San Carlos, C.P. 44460, Guadalajara, Jalisco', NULL, NULL, '#F2994A', '#0A0F1E', '/images/seccionesLogo/logo3.jpg', '/images/seccionesBanner/banner3.jpg', 2, '2026-08-05 15:31:08'),
(4, 4, 'IV', 'Veracruz Sur', '¡Resistencia y Fortaleza Sindical Ahora!', 'Av. Universidad Veracruzana 800, Palma Sola, C.P. 96576, Coatzacoalcos, Veracruz', NULL, NULL, '#27AE60', '#0A0F1E', '/images/seccionesLogo/logo4.jpg', '/images/seccionesBanner/banner4.jpg', 2, '2026-08-05 15:31:08'),
(5, 5, 'V', 'Estado de México Oriente', '¡Trabajadores con Visión de Futuro!', 'Calle Cuitláhuac 35, San Javier, C.P. 54030, Tlalnepantla, Estado de México', NULL, NULL, '#E74C3C', '#0A0F1E', '/images/seccionesLogo/logo5.jpg', '/images/seccionesBanner/banner5.jpg', 2, '2026-08-05 15:31:08'),
(6, 6, 'VI', 'Yucatán', '¡Unidad y Compromiso Laboral!', 'Calle 38 #477, entre 39, Industrial Fénix, C.P. 97150, Mérida, Yucatán', NULL, NULL, '#8E44AD', '#0A0F1E', '/images/seccionesLogo/logo6.jpg', '/images/seccionesBanner/banner6.jpg', 2, '2026-08-05 15:31:08'),
(7, 7, 'VII', 'Baja California', '¡Frontera de Lucha Sindical!', 'Av. Ejército Nacional y Gob. Esteban Cantú s/n / Av. Gobernador José Inocencio Lugo 1965, Mexicali / Ensenada, Baja California', NULL, NULL, '#1ABC9C', '#0A0F1E', '/images/seccionesLogo/logo7.png', '/images/seccionesBanner/banner7.jpg', 2, '2026-08-05 15:31:08'),
(8, 8, 'VIII', 'Chihuahua', '¡Convicción y Defensa Obrera!', 'Av. Independencia 715, El Palomar, C.P. 31203, Chihuahua, Chihuahua', NULL, NULL, '#E67E22', '#0A0F1E', '/images/seccionesLogo/logo8.webp', '/images/seccionesBanner/banner8.png', 2, '2026-08-05 15:31:08'),
(9, 9, 'IX', 'Veracruz Norte', '¡Rescate de Nuestros Derechos!', 'Enrique C. Rébsamen 26, Zona Centro, C.P. 91000, Xalapa, Veracruz', NULL, NULL, '#3498DB', '#0A0F1E', '/images/seccionesLogo/logo9.jpg', '/images/seccionesBanner/banner9.jpeg', 2, '2026-08-05 15:31:08'),
(10, 10, 'X', 'Tamaulipas', '¡Juntos por el Cambio Social!', 'Av. Morelos Pte. 406, Zona Centro, C.P. 87000, Ciudad Victoria, Tamaulipas', NULL, NULL, '#2ECC71', '#0A0F1E', '/images/seccionesLogo/logo10.png', '/images/seccionesBanner/banner10.jpg', 2, '2026-08-05 15:31:08'),
(11, 11, 'XI', 'Sinaloa', '¡Sindicato Fuerte, Trabajadores Unidos!', 'Río San Lorenzo 380, Guadalupe, C.P. 80000, Culiacán, Sinaloa', NULL, NULL, '#F39C12', '#0A0F1E', '/images/seccionesLogo/logo11.webp', '/images/seccionesBanner/banner11.png', 2, '2026-08-05 15:31:08'),
(12, 12, 'XII', 'Coahuila', '¡Por la Justicia Laboral!', 'Manuel Doblado 529, Zona Centro, C.P. 25000, Saltillo, Coahuila', NULL, NULL, '#9B59B6', '#0A0F1E', '/images/seccionesLogo/logo12.jpg', '/images/seccionesBanner/banner12.jpeg', 2, '2026-08-05 15:31:08'),
(13, 13, 'XIII', 'Sonora', '¡Trabajo Digno, Futuro Seguro!', 'C. California 156, Centro, Urb. No. 5, C.P. 85000, Ciudad Obregón, Sonora', NULL, NULL, '#1ABC9C', '#0A0F1E', '/images/seccionesLogo/logo13.png', '/images/seccionesBanner/banner13.jpg', 2, '2026-08-05 15:31:08'),
(14, 14, 'XIV', 'Chiapas', '¡Resistencia del Pueblo Trabajador!', 'Miguel Hidalgo, Hidalgo, C.P. 29000, Tuxtla Gutiérrez, Chiapas', NULL, NULL, '#E74C3C', '#0A0F1E', '/images/seccionesLogo/logo14.webp', '/images/seccionesBanner/banner14.png', 2, '2026-08-05 15:31:08'),
(15, 15, 'XV', 'Guanajuato', '¡Unidos por el Bienestar Laboral!', 'Blvd. López Mateos Pte. 2201, Jardines del Moral, C.P. 37160, León, Guanajuato', NULL, NULL, '#3498DB', '#0A0F1E', '/images/seccionesLogo/logo15.jpg', '/images/seccionesBanner/banner15.jpeg', 2, '2026-08-05 15:31:08'),
(16, 16, 'XVI', 'Durango', '¡Fortaleza Sindical Sin Límites!', 'Fanny Anitua 1441, Los Ángeles, C.P. 34076, Durango, Durango', NULL, NULL, '#F1C40F', '#0A0F1E', '/images/seccionesLogo/logo16.png', '/images/seccionesBanner/banner16.jpg', 2, '2026-08-05 15:31:08'),
(17, 17, 'XVII', 'Guerrero', '¡Convicción y Lucha Obrera!', 'Av. Ruiz Cortines s/n, Alta Progreso, C.P. 39350, Acapulco, Guerrero', NULL, NULL, '#2ECC71', '#0A0F1E', '/images/seccionesLogo/logo17.webp', '/images/seccionesBanner/banner17.png', 2, '2026-08-05 15:31:08'),
(18, 18, 'XVIII', 'San Luis Potosí', '¡Rescate del Trabajo Digno!', 'Av. Cuauhtémoc 708, Tequisquiapan, C.P. 78250, San Luis Potosí, San Luis Potosí', NULL, NULL, '#E67E22', '#0A0F1E', '/images/seccionesLogo/logo18.jpg', '/images/seccionesBanner/banner18.jpeg', 2, '2026-08-05 15:31:08'),
(19, 19, 'XIX', 'Morelos', '¡Visión de Futuro Sindical!', 'C. Cnel. Ahumada 133, Chapultepec, C.P. 62450, Cuernavaca, Morelos', NULL, NULL, '#9B59B6', '#0A0F1E', '/images/seccionesLogo/logo19.png', '/images/seccionesBanner/banner19.jpg', 2, '2026-08-05 15:31:08'),
(20, 20, 'XX', 'Michoacán', '¡Fuerza y Unidad del Sindicato!', 'Av. Acueducto 2271, Lomas de Hidalgo, C.P. 58240, Morelia, Michoacán', NULL, NULL, '#1ABC9C', '#0A0F1E', '/images/seccionesLogo/logo20.webp', '/images/seccionesBanner/banner20.png', 2, '2026-08-05 15:31:08'),
(21, 21, 'XXI', 'Aguascalientes', '¡Trabajadores en Acción!', 'Av. José María Chávez 1114-B, Bulevar, C.P. 20270, Aguascalientes, Aguascalientes', NULL, NULL, '#F39C12', '#0A0F1E', '/images/seccionesLogo/logo21.jpg', '/images/seccionesBanner/banner21.jpeg', 2, '2026-08-05 15:31:08'),
(22, 22, 'XXII', 'Hidalgo', '¡Resistencia y Transformación!', 'Av. de Los Cedros 100, Nueva Francisco I. Madero, La Hacienda, C.P. 42070, Pachuca, Hidalgo', NULL, NULL, '#3498DB', '#0A0F1E', '/images/seccionesLogo/logo22.png', '/images/seccionesBanner/banner22.jpg', 2, '2026-08-05 15:31:08'),
(23, 23, 'XXIII', 'Querétaro', '¡Juntos por la Defensa Obrera!', 'Circuito del Mesón 138, Col. del Prado, C.P. 76030, Santiago de Querétaro, Querétaro', NULL, NULL, '#2ECC71', '#0A0F1E', '/images/seccionesLogo/logo23.webp', '/images/seccionesBanner/banner23.png', 2, '2026-08-05 15:31:08'),
(24, 24, 'XXIV', 'Nayarit', '¡Convicción Sindical, Futuro Seguro!', 'C. José María Mercado 44, San Antonio, C.P. 63159, Tepic, Nayarit', NULL, NULL, '#E74C3C', '#0A0F1E', '/images/seccionesLogo/logo24.jpg', '/images/seccionesBanner/banner24.jpeg', 2, '2026-08-05 15:31:08'),
(25, 25, 'XXV', 'Colima', '¡Unidad y Resistencia!', 'Av. Niños Héroes 660, El Moralete, C.P. 28060, Colima, Colima', NULL, NULL, '#8E44AD', '#0A0F1E', '/images/seccionesLogo/logo25.png', '/images/seccionesBanner/banner25.jpg', 2, '2026-08-05 15:31:08'),
(26, 26, 'XXVI', 'Tabasco', '¡Fuerza del Sindicato en Acción!', 'Av. Gral. Augusto César Sandino 407, Reforma, C.P. 86190, Villahermosa, Tabasco', NULL, NULL, '#F1C40F', '#0A0F1E', '/images/seccionesLogo/logo26.webp', '/images/seccionesBanner/banner26.png', 2, '2026-08-05 15:31:08'),
(27, 27, 'XXVII', 'Campeche', '¡Rescate de la Dignidad Obrera!', 'Av. Resurgimiento s/n, Montecristo, C.P. 24030, San Francisco de Campeche, Campeche', NULL, NULL, '#27AE60', '#0A0F1E', '/images/seccionesLogo/logo27.jpg', '/images/seccionesBanner/banner27.jpeg', 2, '2026-08-05 15:31:08'),
(28, 28, 'XXVIII', 'Oaxaca', '¡Visión y Compromiso Sindical!', 'Díaz Quintas 412, Centro, C.P. 68040, Oaxaca de Juárez, Oaxaca', NULL, NULL, '#E67E22', '#0A0F1E', '/images/seccionesLogo/logo28.png', '/images/seccionesBanner/banner28.jpg', 2, '2026-08-05 15:31:08'),
(29, 29, 'XXIX', 'Zacatecas', '¡Trabajadores con Convicción!', 'Benito López Bernal 105, Lomas de la Soledad, C.P. 98040, Zacatecas, Zacatecas', NULL, NULL, '#3498DB', '#0A0F1E', '/images/seccionesLogo/logo29.webp', '/images/seccionesBanner/banner29.png', 2, '2026-08-05 15:31:08'),
(30, 30, 'XXX', 'Tlaxcala', '¡Juntos por un Futuro Mejor!', 'Av. Politécnico / Nacional 1, San Diego Metepec, C.P. 90010, Tlaxcala de Xicohténcatl, Tlaxcala', NULL, NULL, '#9B59B6', '#0A0F1E', '/images/seccionesLogo/logo30.jpg', '/images/seccionesBanner/banner30.jpeg', 2, '2026-08-05 15:31:08'),
(31, 31, 'XXXI', 'Baja California Sur', '¡Fortaleza y Unidad Sindical!', 'José María Morelos y Pavón 670, Esterito, C.P. 23000, La Paz, Baja California Sur', NULL, NULL, '#1ABC9C', '#0A0F1E', '/images/seccionesLogo/logo31.png', '/images/seccionesBanner/banner31.jpg', 2, '2026-08-05 15:31:08'),
(32, 32, 'XXXII', 'CDMX Noroeste', '¡Resistencia y Lucha Capitalina!', 'C. 13 #119, Pro Hogar, Azcapotzalco, C.P. 02600, Ciudad de México', NULL, NULL, '#F39C12', '#0A0F1E', '/images/seccionesLogo/logo32.webp', '/images/seccionesBanner/banner32.png', 2, '2026-08-05 15:31:08'),
(33, 33, 'XXXIII', 'CDMX Noreste', 'Unidad y Fortaleza Sindical', 'C. Florines 9, Amp. Simón Bolívar, Venustiano Carranza, C.P. 15420, Ciudad de México', NULL, NULL, '#3EAEF4', '#0A0F1E', '/images/seccionesLogo/logo33.jpeg', '/images/seccionesBanner/banner33.jpg', 2, '2026-08-05 15:31:08'),
(34, 34, 'XXXIV', 'CDMX Suroeste', '¡Por un Trabajo Digno!', 'Luis Carracci 12, San Juan, Benito Juárez, C.P. 03730, Ciudad de México', NULL, NULL, '#E74C3C', '#0A0F1E', '/images/seccionesLogo/logo34.png', '/images/seccionesBanner/banner34.jpg', 2, '2026-08-05 15:31:08'),
(35, 35, 'XXXV', 'CDMX Sureste', '¡Fuerza Sindical en Acción!', 'Canela 558, Granjas México, Iztacalco, C.P. 08400, Ciudad de México', NULL, NULL, '#2ECC71', '#0A0F1E', '/images/seccionesLogo/logo35.webp', '/images/seccionesBanner/banner35.png', 2, '2026-08-05 15:31:08'),
(36, 36, 'XXXVI', 'Quintana Roo', '¡Resistencia y Desarrollo Laboral!', 'Calle 52 Pte. 669, C.P. 77516, Cancún, Quintana Roo', NULL, NULL, '#8E44AD', '#0A0F1E', '/images/seccionesLogo/logo36.jpg', '/images/seccionesBanner/banner36.jpeg', 2, '2026-08-05 15:31:08'),
(37, 37, 'XXXVII', 'Estado de México Poniente', '¡Juntos por la Defensa Sindical!', 'Av. Valle de México No. 4, Col. El Mirador, C.P. 53050, Naucalpan, Estado de México', NULL, NULL, '#27AE60', '#0A0F1E', '/images/seccionesLogo/logo37.png', '/images/seccionesBanner/banner37.jpg', 2, '2026-08-05 15:31:08'),
(38, 38, 'XXXVIII', 'Modulo Central', 'Todos Juntos, Todos Fuertes', 'Zamora 107, Colonia Condesa, Cuauhtémoc, 06140 Ciudad de México, CDMX', NULL, NULL, '#FFD700', '#0A0F1E', '/images/seccionesLogo/logoD.png', '/images/seccionesBanner/bannerD.jpg', 2, '2026-08-05 15:31:08'),
(39, 39, 'XXXIX', 'Comite Ejecutivo Nacional', 'Todos Juntos, Todos Fuertes', 'Zamora 107, Colonia Condesa, Cuauhtémoc, 06140 Ciudad de México, CDMX', NULL, NULL, '#FFD700', '#0A0F1E', '/images/seccionesLogo/logoD.jpg', '/images/seccionesBanner/bannerD.jpg', 2, '2026-08-05 15:31:08');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `secciones`
--
ALTER TABLE `secciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `arabigo` (`arabigo`),
  ADD UNIQUE KEY `romano` (`romano`),
  ADD KEY `idx_arabigo` (`arabigo`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `secciones`
--
ALTER TABLE `secciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
