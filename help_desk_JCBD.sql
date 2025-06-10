-- Active: 1744258976597@@127.0.0.1@3306@help_desk_jcbd
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-05-2025 a las 19:25:56
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre_categoria`, `descripcion`) VALUES
(1, 'Hardware', 'Problemas relacionados con equipos físicos'),
(2, 'Software', 'Problemas relacionados con programas y sistemas'),
(3, 'Red', 'Problemas de conectividad y redes'),
(4, 'Cuentas', 'Gestión de cuentas y permisos de usuarios');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entidades`
--

CREATE TABLE `entidades` (
  `id_entidad` int(11) NOT NULL,
  `nombre_entidad` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entidades`
--

INSERT INTO `entidades` (`id_entidad`, `nombre_entidad`, `descripcion`) VALUES
(1, 'Departamento de TI', 'Departamento de Tecnologías de la Información'),
(2, 'Recursos Humanos', 'Departamento de gestión de personal'),
(3, 'Contabilidad', 'Departamento financiero y contable'),
(4, 'Operaciones', 'Departamento de operaciones generales');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tickets`
--

CREATE TABLE `tickets` (
  `id_ticket` int(11) NOT NULL,
  `prioridad` varchar(100) NOT NULL,
  `estado_ticket` varchar(100) NOT NULL DEFAULT 'nuevo',
  `tipo` varchar(100) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `grupo` varchar(100) NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `adjuntos` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `id_categoria1` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `rol` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'activo',
  `id_entidad1` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `correo`, `telefono`, `nombre_usuario`, `contraseña`, `rol`, `estado`, `id_entidad1`, `fecha_registro`) VALUES
(1, 'Admin Sistema', 'admin@helpdeskjcbd.com', '123456789', 'admin', 'admin123', 'administrador', 'activo', 1, '2025-04-09 06:39:51'),
(2, 'Prueba Usuario', 'prueba1@helpdeskjcbd.com', '123456789', 'prueba_1', '12345', 'usuario', 'activo', 2, '2025-04-09 06:39:51'),
(3, 'Sistema Usuario', 'prueba2@helpdeskjcbd.com', '123456789', 'prueba_2', '1234', 'usuario', 'activo', 3, '2025-04-09 06:39:51'),
(4, 'Técnico Principal', 'tecnico1@helpdeskjcbd.com', '123456789', 'tecnico_1', '123456', 'tecnico', 'activo', 1, '2025-04-09 06:39:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_tickets`
--

CREATE TABLE `usuarios_tickets` (
  `id_usuario1` int(11) NOT NULL,
  `id_ticket1` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `entidades`
--
ALTER TABLE `entidades`
  ADD PRIMARY KEY (`id_entidad`);

--
-- Indices de la tabla `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id_ticket`),
  ADD KEY `id_categoria1` (`id_categoria1`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD KEY `id_entidad1` (`id_entidad1`);

--
-- Indices de la tabla `usuarios_tickets`
--
ALTER TABLE `usuarios_tickets`
  ADD PRIMARY KEY (`id_usuario1`,`id_ticket1`),
  ADD KEY `id_ticket1` (`id_ticket1`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `entidades`
--
ALTER TABLE `entidades`
  MODIFY `id_entidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`id_categoria1`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_entidad1`) REFERENCES `entidades` (`id_entidad`) ON DELETE SET NULL;

--
-- Filtros para la tabla `usuarios_tickets`
--
ALTER TABLE `usuarios_tickets`
  ADD CONSTRAINT `usuarios_tickets_ibfk_1` FOREIGN KEY (`id_usuario1`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuarios_tickets_ibfk_2` FOREIGN KEY (`id_ticket1`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
