-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Servidor: db5020055703.hosting-data.io
-- Tiempo de generación: 23-06-2026 a las 17:18:47
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
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `matricula` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `adscripcion` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `curp` varchar(18) COLLATE utf8mb4_general_ci NOT NULL,
  `antiguedad` varchar(2) COLLATE utf8mb4_general_ci NOT NULL,
  `sexo` enum('M','F','O') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contrasena` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idRol` text COLLATE utf8mb4_general_ci,
  `codigo_2fa` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `intentos_fallidos` int DEFAULT '0',
  `bloqueo_hasta` datetime DEFAULT NULL,
  `fecha_registro` datetime DEFAULT NULL,
  `status` tinyint DEFAULT '2'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `matricula`, `nombre`, `adscripcion`, `categoria`, `curp`, `antiguedad`, `sexo`, `telefono`, `correo`, `contrasena`, `idRol`, `codigo_2fa`, `two_factor_enabled`, `intentos_fallidos`, `bloqueo_hasta`, `fecha_registro`, `status`) VALUES
(12, '97158643', 'MARCO ANTONIO/ESPINOSA/SERRANO', 'COMITE EJECUTIVO NACIONAL', 'DISEÑO Y DESARROLLO DIGITAL', 'EISM820310HDFSRR09', '', 'M', '5616691510', 'espi_neza@hotmail.com', '$2y$12$cj6Mk7cyJwIrXethrjf/Ue60Xxv34MAeEYyMIM3TwznidLdYso3gm', '1', 'XCWUJPWVYXV4YJCP', 1, 0, NULL, '2026-06-22 12:21:19', 2),
(13, '261271064', 'itsamma Luis/Martinez/Camargo  ', 'UMF 183', 'DUEÑO DEL IMSS 80', 'MACI050212HMCRMTA7', '3', 'M', '5613370749', 'javis.05luis@gmail.com', '$2y$12$O5UpLuB47p/.GfCXMzrke.6IKzmCp/TNSUAEJTlO9YX1s7sRDyzH6', '2', 'B6Z3QHGJRRDM25BU', 0, NULL, NULL, '2026-06-01 19:40:35', 2),
(15, '261271059', 'Jorge/Luque/Mendoza ', 'UMF 75', 'MEDICO FAMILIAR 80', 'LUMJ050325HMCQNRA2', '5', 'M', '5548671213', 'jorgeluquito@gmail.com', '$2y$12$wRMCd9Icg4O7ppr/I05cX.XhttD4D5wXKCWFaAJrXimX.X3R9rtPW', '2', '4WM6QFPTZ6BJ4SL2', 1, NULL, NULL, '2026-05-31 12:53:17', 2),
(16, '261271090', 'Estefany Mariana/Reyes/Baez', 'HGZ 197', 'ENFERMERA GENERAL 80', 'REBE040807MDFYZSA6', '8', 'F', '5577908132', 'fanireyesb@gmail.com', '$2y$12$QqynwEk3.B1u5fvb4Vc4nuQVK2TvHtG5F5oGd3ncXQGFZ4W59p1HK', '2', NULL, 0, NULL, NULL, '2026-05-28 01:19:25', 2),
(17, '261271056', 'Fabiola Guadalupe/Lara/Ortega', 'HGZ 25', 'ENFERMERA CLINICA', 'LAOF010928MMCRRBA6', '4', 'F', NULL, 'fabylo117@gmail.com', '$2y$12$IBUfdF0fNXOCCPr1YxW.h.zq8g2OMVA9SfMJgOhPFruDVUo7Qems.', '2', NULL, 0, NULL, NULL, '2026-05-31 14:13:14', 2),
(18, '261271085', 'EDGAR ADAD/PEREZ/CERQUEDA', 'HOSPITAL GENERAL DE ZONA 53', 'LABORATORISTA CLINICO 80', 'PECE951121HDFRRD01', '8', 'M', NULL, '261271085@alumnos.utn.edu.mx', '$2y$12$Da7mZohQBClSEnqC7AMTQ.uO/971bxRd46HzlVa8ZCuuYeMkTIVc2', '2', NULL, 0, NULL, NULL, '2026-05-31 16:20:35', 2),
(19, '95152483', 'DANIA THAILY/ESPINOSA/CRUZ', 'HOSPITAL GENERAL DE ZONA 53', 'ENFERMENSA GENERAL 80', 'EICD011005MMCSRNA7', '', 'F', '5614371535', 'thailyy.espi@gmail.com', '$2y$12$5af/e6ozu1fzx/E7FNTyyOvRZxCsx9vEQaxRigpedmBcdJN7rvi7i', NULL, NULL, 0, NULL, NULL, '2026-06-12 02:00:18', 2),
(20, '96159549', 'ILEAN AZUL/ESPINOSA/CRUZ', 'HOSPITAL GENERAL DE ZONA 197', 'AUX DE ENFERMERIA GENERAL 80', 'EICI000318MMCSRLA3', '', 'F', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 2),
(21, '136013600', 'JOVAN/DEL PRADO/LOPEZ', 'UNIVERCIDAD TECNOLOGICA DE NEZAHUALCÓYOTL', 'DESARROLLO WEB PROFECIONAL', 'PALJ800831HDFRPV05', '15', 'M', '5613370749', 'jovan.dpl@gmail.com', '$2y$12$xxucH7FqW0EY21tEG/1Waug599IJ6CyqQCJVZcT8RkN3bYw48qszq', NULL, 'ML6KOIHKD3H4UTPY', 1, NULL, NULL, '2026-06-17 18:19:36', 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matricula` (`matricula`),
  ADD UNIQUE KEY `curp` (`curp`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
