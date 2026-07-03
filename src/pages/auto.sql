-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Servidor: db5020055703.hosting-data.io
-- Tiempo de generación: 23-06-2026 a las 17:19:06
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
-- Estructura de tabla para la tabla `auto`
--

CREATE TABLE `auto` (
  `id` int NOT NULL,
  `matricula` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `valido` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_validado` datetime DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auto`
--

INSERT INTO `auto` (`id`, `matricula`, `fecha_registro`, `valido`, `observaciones`, `fecha_validado`, `status`) VALUES
(4, '96159549', '2026-05-31 04:13:52', 'MARCO ANTONIO/ESPINOSA/SERRANO (97158643)', 'FELICIDADES', '2026-05-31 04:15:22', 2),
(5, '95152483', '2026-05-31 04:14:25', 'MARCO ANTONIO/ESPINOSA/SERRANO (97158643)', 'SIGA PARTICIPANDO', '2026-05-31 04:15:55', 5),
(6, '261271059', '2026-05-31 12:53:59', 'MARCO ANTONIO/ESPINOSA/SERRANO (97158643)', 'LO SENTIMOS!! El credito fue denegado ya que sus documentos son tareas de la escuela.', '2026-05-31 17:10:39', 5),
(7, '261271056', '2026-05-31 14:58:36', 'MARCO ANTONIO/ESPINOSA/SERRANO (97158643)', 'Intenta tu registro nuevamente, subiste un documento de asignación de profesores.', '2026-05-31 16:30:19', 3),
(8, '261271085', '2026-05-31 16:27:09', 'MARCO ANTONIO/ESPINOSA/SERRANO (97158643)', 'Ya fuiste por que ya no hay sistema', '2026-06-03 18:46:31', 2),
(9, '97158643', '2026-06-22 14:11:59', NULL, NULL, NULL, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auto`
--
ALTER TABLE `auto`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auto`
--
ALTER TABLE `auto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
