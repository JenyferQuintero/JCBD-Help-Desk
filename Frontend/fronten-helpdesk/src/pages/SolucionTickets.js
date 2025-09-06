import React, { useState, useEffect } from "react";
import {
  Outlet,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import {
  FcHome,
  FcAssistant,
  FcBusinessman,
  FcAutomatic,
  FcAnswers,
  FcCustomerSupport,
  FcExpired,
  FcGenealogy,
  FcBullish,
  FcConferenceCall,
  FcPortraitMode,
  FcOrganization,
} from "react-icons/fc";
import { FaRegClock, FaCheckCircle, FaHistory, FaTools, FaUserCheck, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import styles from "../styles/SolucionTickets.module.css";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";

const SolucionTickets = () => {
  // Estados del componente
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  
  // Estados para asignación
  const [grupos, setGrupos] = useState([]);
  const [tecnicosPorGrupo, setTecnicosPorGrupo] = useState([]);
  
  const [ticket, setTicket] = useState({
    id: "",
    titulo: "",
    descripcion: "",
    solicitante: "",
    prioridad: "",
    estado: "",
    tecnico: "",
    grupo: "",
    categoria: "",
    fechaApertura: "",
    ultimaActualizacion: "",
    tipo: "incidencia",
    ubicacion: "",
    observador: "",
    asignadoA: "",
    grupoAsignado: "",
    id_categoria: "",
    id_grupo: "",
    id_tecnico_asignado: ""
  });
  
  // Nuevos estados para seguimientos y solución
  const [seguimientos, setSeguimientos] = useState([]);
  const [solucion, setSolucion] = useState(null);
  const [showSeguimientoForm, setShowSeguimientoForm] = useState(true);
  const [showSolucionForm, setShowSolucionForm] = useState(false);
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState({
    observaciones: "",
    tipo_visita: "seguimiento",
    acciones_realizadas: "",
    encontro_usuario: null
  });
  
  // Estado para controlar si el botón de solución debe estar deshabilitado
  const [isTicketClosed, setIsTicketClosed] = useState(false);
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadoTicket, setEstadoTicket] = useState({});

  // Datos del usuario
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol");
  const isAdminOrTech = ["administrador", "tecnico"].includes(userRole);

  // Obtener datos del ticket y relacionados
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Obtener datos del ticket
        const ticketRes = await axios.get(
          `http://localhost:5000/usuarios/tickets/${id}`
        );
        console.log("Ticket recibido:", ticketRes.data);
        
        // Obtener categorías
        const categoriasRes = await axios.get(
          "http://localhost:5000/usuarios/obtenerCategorias"
        );
        setCategorias(categoriasRes.data);

        // Obtener grupos
        const gruposRes = await axios.get(
          "http://localhost:5000/usuarios/obtenerGrupos"
        );
        setGrupos(gruposRes.data);

        // Cargar seguimientos, solución y estado
        const [seguimientosRes, solucionRes, estadoRes] = await Promise.all([
          axios.get(`http://localhost:5000/usuarios/tickets/${id}/seguimientos`),
          axios.get(`http://localhost:5000/usuarios/tickets/${id}/solucion`),
          axios.get(`http://localhost:5000/usuarios/tickets/${id}/estado`)
        ]);
        
        setSeguimientos(seguimientosRes.data);
        setSolucion(solucionRes.data);
        setEstadoTicket(estadoRes.data);

        // Establecer datos del ticket después de cargar categorías y grupos
        const ticketData = ticketRes.data;
        
        // Asegurarnos de que el solicitante se cargue correctamente
        setTicket({
          ...ticketData,
          solicitante: ticketData.solicitante || "Solicitante no disponible"
        });

        // Establecer si el ticket está cerrado
        setIsTicketClosed(ticketData.estado === 'resuelto');

        // Si el ticket tiene grupo, cargar técnicos de ese grupo
        if (ticketData.id_grupo) {
          cargarTecnicosPorGrupo(ticketData.id_grupo);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Función para cargar técnicos por grupo
  const cargarTecnicosPorGrupo = async (grupoId) => {
    try {
      console.log("Cargando técnicos para grupo:", grupoId);
      if (!grupoId) {
        setTecnicosPorGrupo([]);
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/usuarios/obtenerTecnicosPorGrupo/${grupoId}`);
      console.log("Técnicos cargados:", response.data);
      setTecnicosPorGrupo(response.data);
    } catch (error) {
      console.error("Error al cargar técnicos:", error);
      setTecnicosPorGrupo([]);
    }
  };

  // Cargar técnicos cuando cambie el grupo en edición
  useEffect(() => {
    if (isEditing && editedTicket.id_grupo1) {
      cargarTecnicosPorGrupo(editedTicket.id_grupo1);
    }
  }, [editedTicket.id_grupo1, isEditing]);

  // Función para obtener el nombre del técnico por ID
  const obtenerNombreTecnico = async (tecnicoId) => {
    if (!tecnicoId) return "Sin asignar";
    
    try {
      const response = await axios.get(`http://localhost:5000/usuarios/obtenerUsuario/${tecnicoId}`);
      return response.data.nombre_completo || "Técnico no encontrado";
    } catch (error) {
      console.error("Error al obtener técnico:", error);
      return "Error al cargar técnico";
    }
  };

  // Función para manejar cambios en la edición
  const handleEditChange = (field, value) => {
    console.log(`Campo ${field} cambiado a:`, value);
    setEditedTicket(prev => ({
      ...prev,
      [field]: value
    }));

    // Si cambia el grupo, cargar técnicos de ese grupo
    if (field === 'id_grupo1' && value) {
      cargarTecnicosPorGrupo(value);
    }
  };

  // Función para guardar los cambios
const handleSaveChanges = async () => {
  try {
    const user_id = localStorage.getItem("id_usuario");
    const user_role = localStorage.getItem("rol");
    const user_nombre = localStorage.getItem("nombre");
    
    // Validar que los IDs existan antes de enviar
    const updateData = {
      titulo: editedTicket.titulo,
      descripcion: editedTicket.descripcion,
      ubicacion: editedTicket.ubicacion,
      prioridad: editedTicket.prioridad,
      tipo: editedTicket.tipo,
      id_categoria1: editedTicket.id_categoria1 || null,
      id_grupo1: editedTicket.id_grupo1 || null,
      id_tecnico_asignado: editedTicket.id_tecnico_asignado || null,
      estado_ticket: editedTicket.estado_ticket,
      user_id: user_id,
      user_role: user_role,
      nombre_modificador: user_nombre
    };

    console.log("Datos validados a enviar:", updateData);

    const response = await axios.put(
      `http://localhost:5000/usuarios/tickets/${id}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      setSuccessMessage("✅ Ticket actualizado correctamente");
      setIsEditing(false);
      
      // Actualizar estado del ticket
      if (updateData.estado_ticket === 'resuelto') {
        setIsTicketClosed(true);
      } else {
        setIsTicketClosed(false);
      }
      
      // Recargar después de guardar
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    console.error("Error al actualizar ticket:", error);
    if (error.response?.data?.message) {
      alert(`❌ Error: ${error.response.data.message}`);
    } else {
      alert("❌ Error de conexión al actualizar el ticket");
    }
  }
};

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTicket({});
  };

  // Inicializar datos de edición cuando se activa
  useEffect(() => {
    if (isEditing && ticket && categorias.length > 0 && grupos.length > 0) {
      // Encontrar la categoría correcta por nombre
      const categoriaEncontrada = categorias.find(cat => 
        cat.nombre_categoria === ticket.categoria
      );

      // Encontrar el grupo correcto por nombre
      const grupoEncontrado = grupos.find(grupo => 
        grupo.nombre_grupo === ticket.grupoAsignado
      );

      console.log("Categoría encontrada:", categoriaEncontrada);
      console.log("Grupo encontrado:", grupoEncontrado);

      setEditedTicket({
        titulo: ticket.titulo || "",
        descripcion: ticket.descripcion || "",
        ubicacion: ticket.ubicacion || "",
        prioridad: ticket.prioridad || "mediana",
        tipo: ticket.tipo || "incidencia",
        id_categoria1: categoriaEncontrada ? categoriaEncontrada.id_categoria : "",
        id_grupo1: grupoEncontrado ? grupoEncontrado.id_grupo : "",
        id_tecnico_asignado: ticket.id_tecnico_asignado || "",
        estado_ticket: ticket.estado || "nuevo"
      });

      // Si ya tiene grupo, cargar sus técnicos
      if (grupoEncontrado) {
        cargarTecnicosPorGrupo(grupoEncontrado.id_grupo);
      }
    }
  }, [isEditing, ticket, categorias, grupos]);

  // Función para cerrar ticket con solución
  const handleCerrarTicket = async () => {
    try {
      const user_id = localStorage.getItem("id_usuario");
      
      if (!nuevoSeguimiento.observaciones.trim()) {
        alert("Por favor ingrese las observaciones de la solución");
        return;
      }

      if (!nuevoSeguimiento.acciones_realizadas.trim()) {
        alert("Por favor ingrese las acciones realizadas");
        return;
      }
      
      await axios.put(`http://localhost:5000/usuarios/tickets/${id}/cerrar`, {
        id_tecnico: user_id,
        comentario: nuevoSeguimiento.observaciones,
        acciones_realizadas: nuevoSeguimiento.acciones_realizadas,
        tipo_cierre: "solucion",
        encontro_usuario: nuevoSeguimiento.encontro_usuario
      });
      
      // Deshabilitar el botón de solución
      setIsTicketClosed(true);
      
      alert("✅ Ticket cerrado correctamente con solución");
      window.location.reload();
    } catch (error) {
      console.error("Error al cerrar ticket:", error);
      alert("❌ Error al cerrar el ticket");
    }
  };

  // Función para agregar seguimiento
  const handleAgregarSeguimiento = async () => {
    try {
      const user_id = localStorage.getItem("id_usuario");
      
      if (!nuevoSeguimiento.observaciones.trim()) {
        alert("Por favor ingrese las observaciones del seguimiento");
        return;
      }
      
      await axios.post(`http://localhost:5000/usuarios/tickets/${id}/seguimiento`, {
        descripcion: nuevoSeguimiento.observaciones,
        id_tecnico: user_id,
        tipo_seguimiento: nuevoSeguimiento.tipo_visita
      });
      
      alert("✅ Seguimiento agregado correctamente");
      setShowSeguimientoForm(false);
      setNuevoSeguimiento({
        observaciones: "",
        tipo_visita: "seguimiento",
        acciones_realizadas: "",
        encontro_usuario: null
      });
      
      // Recargar seguimientos
      const response = await axios.get(`http://localhost:5000/usuarios/tickets/${id}/seguimientos`);
      setSeguimientos(response.data);
    } catch (error) {
      console.error("Error al agregar seguimiento:", error);
      alert("❌ Error al agregar seguimiento");
    }
  };

  // Función para reabrir ticket (para usuarios)
// Función para reabrir ticket (para usuarios) - ACTUALIZADA
const handleReabrirTicket = async () => {
  try {
    const user_id = localStorage.getItem("id_usuario");
    
    // Crear modal personalizado en lugar de usar prompt
    const modal = document.createElement('div');
    modal.className = styles.reabrirModalOverlay;
    modal.innerHTML = `
      <div class="${styles.reabrirModal}">
        <h3>Reabrir Ticket</h3>
        <p>¿Por qué deseas reabrir este ticket?</p>
        <textarea id="reabrirMotivo" placeholder="Describe el motivo de la reapertura..." rows="4"></textarea>
        <div class="${styles.modalButtons}">
          <button id="cancelarReapertura" class="${styles.cancelButton}">Cancelar</button>
          <button id="confirmarReapertura" class="${styles.submitButton}">Reabrir Ticket</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus en el textarea
    setTimeout(() => {
      const textarea = document.getElementById('reabrirMotivo');
      if (textarea) textarea.focus();
    }, 100);
    
    // Esperar a que el usuario interactúe con el modal
    const comentario = await new Promise((resolve) => {
      document.getElementById('cancelarReapertura').onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };
      
      document.getElementById('confirmarReapertura').onclick = () => {
        const motivo = document.getElementById('reabrirMotivo').value.trim();
        if (!motivo) {
          alert("Por favor ingrese el motivo de la reapertura");
          return;
        }
        document.body.removeChild(modal);
        resolve(motivo);
      };
    });
    
    if (!comentario) return;
    
    await axios.put(`http://localhost:5000/usuarios/tickets/${id}/reabrir`, {
      comentario,
      usuario_id: user_id
    });
    
    // Habilitar el botón de solución nuevamente
    setIsTicketClosed(false);
    
    alert("✅ Ticket reabierto correctamente");
    window.location.reload();
  } catch (error) {
    console.error("Error al reabrir ticket:", error);
    alert("❌ Error al reabrir el ticket");
  }
};
  // Handlers del menú
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleSupport = () => {
    setIsSupportOpen(!isSupportOpen);
    setIsAdminOpen(false);
    setIsConfigOpen(false);
  };

  const toggleAdmin = () => {
    setIsAdminOpen(!isAdminOpen);
    setIsSupportOpen(false);
    setIsConfigOpen(false);
  };

  const toggleConfig = () => {
    setIsConfigOpen(!isConfigOpen);
    setIsSupportOpen(false);
    setIsAdminOpen(false);
  };

  // FUNCIÓN RENDERMENUBYROLE
  const renderMenuByRole = () => {
    switch (userRole) {
      case 'administrador':
        return (
          <ul className={styles.menuIconos}>
            <li className={styles.iconosMenu}>
              <Link to="/HomeAdmiPage" className={styles.linkSinSubrayado}>
                <FcHome className={styles.menuIcon} />
                <span className={styles.menuText}>Inicio</span>
              </Link>
            </li>
            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleSupport}>
                <FcAssistant className={styles.menuIcon} />
                <span className={styles.menuText}> Soporte</span>
              </div>
              <ul className={`${styles.submenu} ${isSupportOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Tickets" className={styles.submenuLink}>
                    <FcAnswers className={styles.menuIcon} />
                    <span className={styles.menuText}>Tickets</span>
                  </Link>
                </li>
                <li>
                  <Link to="/CrearCasoAdmin" className={styles.submenuLink}>
                    <FcCustomerSupport className={styles.menuIcon} />
                    <span className={styles.menuText}>Crear Caso</span>
                  </Link>
                </li>
                <li>
                  <Link to="/Estadisticas" className={styles.submenuLink}>
                    <FcBullish className={styles.menuIcon} />
                    <span className={styles.menuText}>Estadísticas</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleAdmin}>
                <FcBusinessman className={styles.menuIcon} />
                <span className={styles.menuText}> Administración</span>
              </div>
              <ul className={`${styles.submenu} ${isAdminOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Usuarios" className={styles.submenuLink}>
                    <FcPortraitMode className={styles.menuIcon} />
                    <span className={styles.menuText}> Usuarios</span>
                  </Link>
                </li>
                <li>
                  <Link to="/Grupos" className={styles.submenuLink}>
                    <FcConferenceCall className={styles.menuIcon} />
                    <span className={styles.menuText}> Grupos</span>
                  </Link>
                </li>
                <li>
                  <Link to="/Entidades" className={styles.submenuLink}>
                    <FcOrganization className={styles.menuIcon} />
                    <span className={styles.menuText}> Entidades</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleConfig}>
                <FcAutomatic className={styles.menuIcon} />
                <span className={styles.menuText}> Configuración</span>
              </div>
              <ul className={`${styles.submenu} ${isConfigOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Categorias" className={styles.submenuLink}>
                    <FcGenealogy className={styles.menuIcon} />
                    <span className={styles.menuText}>Categorias</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        );
      case 'tecnico':
        return (
          <ul className={styles.menuIconos}>
            <li className={styles.iconosMenu}>
              <Link to="/HomeTecnicoPage" className={styles.linkSinSubrayado}>
                <FcHome className={styles.menuIcon} />
                <span className={styles.menuText}>Inicio</span>
              </Link>
            </li>
            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleSupport}>
                <FcAssistant className={styles.menuIcon} />
                <span className={styles.menuText}> Soporte</span>
              </div>
              <ul className={`${styles.submenu} ${isSupportOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Tickets" className={styles.submenuLink}>
                    <FcAnswers className={styles.menuIcon} />
                    <span className={styles.menuText}>Tickets</span>
                  </Link>
                </li>
                <li>
                  <Link to="/CrearCasoAdmin" className={styles.submenuLink}>
                    <FcCustomerSupport className={styles.menuIcon} />
                    <span className={styles.menuText}>Crear Caso</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className={styles.iconosMenu}>
              <div className={styles.linkSinSubrayado} onClick={toggleAdmin}>
                <FcBusinessman className={styles.menuIcon} />
                <span className={styles.menuText}> Administración</span>
              </div>
              <ul className={`${styles.submenu} ${isAdminOpen ? styles.showSubmenu : ''}`}>
                <li>
                  <Link to="/Usuarios" className={styles.submenuLink}>
                    <FcPortraitMode className={styles.menuIcon} />
                    <span className={styles.menuText}> Usuarios</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        );
      case 'usuario':
      default:
        return (
          <ul className={styles.menuIconos}>
            <li className={styles.iconosMenu}>
              <Link to="/home" className={styles.linkSinSubrayado}>
                <FcHome className={styles.menuIcon} />
                <span className={styles.menuText}>Inicio</span>
              </Link>
            </li>
            <li className={styles.iconosMenu}>
              <Link to="/CrearCasoUse" className={styles.linkSinSubrayado}>
                <FcCustomerSupport className={styles.menuIcon} />
                <span className={styles.menuText}>Crear Caso</span>
              </Link>
            </li>
            <li className={styles.iconosMenu}>
              <Link to="/Tickets" className={styles.linkSinSubrayado}>
                <FcAnswers className={styles.menuIcon} />
                <span className={styles.menuText}>Tickets</span>
              </Link>
            </li>
          </ul>
        );
    }
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      return dateString.substring(0, 16);
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const pad = (num) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const getRouteByRole = (section) => {
    if (section === 'inicio') {
      if (userRole === 'administrador') {
        return '/HomeAdmiPage';
      } else if (userRole === 'tecnico') {
        return '/HomeTecnicoPage';
      } else {
        return '/home';
      }
    } else if (section === 'crear-caso') {
      if (userRole === 'administrador') {
        return '/CrearCasoAdmin';
      } else if (userRole === 'tecnico') {
        return '/CrearCasoAdmin';
      } else {
        return '/CrearCasoUse';
      }
    } 
    if (section === "tickets") return "/Tickets";
    return "/";
  };

  if (loading) {
    return <div className={styles.loading}>Cargando ticket...</div>;
  }

  return (
    <div className={styles.containerPrincipal}>
      {/* Menú Vertical */}
      <aside
        className={`${styles.menuVertical} ${isMenuExpanded ? styles.expanded : ""}`}
        onMouseEnter={() => setIsMenuExpanded(true)}
        onMouseLeave={() => setIsMenuExpanded(false)}
      >
        <div className={styles.containerFluidMenu}>
          <div className={styles.logoContainer}>
            <img src={Logo} alt="Logo" />
          </div>
          <button
            className={`${styles.menuButton} ${styles.mobileMenuButton}`}
            type="button"
            onClick={toggleMobileMenu}
          >
            <FiAlignJustify className={styles.menuIcon} />
          </button>
          <div className={`${styles.menuVerticalDesplegable} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
            {renderMenuByRole()}
          </div>
          <div className={styles.floatingContainer}>
            <div className={styles.menuLogoEmpresarial}>
              <img src={Logoempresarial} alt="Logo Empresarial" />
            </div>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className={styles.containerInicio} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        <div className={styles.containerInicioImg}>
          <Link to={getRouteByRole("inicio")} className={styles.linkSinSubrayado}>
            <FcHome className={styles.menuIcon} />
            <span>Inicio</span>
          </Link>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.searchContainer}>
            <input
              className={styles.search}
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.buttonBuscar} title="Buscar" disabled={isLoading || !searchTerm.trim()}>
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
            {isLoading && <span className={styles.loading}>Buscando...</span>}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.userContainer}>
            <span className={styles.username}>
              Bienvenido, <span id="nombreusuario">{nombre}</span>
            </span>
            <div className={styles.iconContainer}>
              <Link to="/">
                <FaPowerOff className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.containerColumnas} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        <div className={styles.containersolucion}>
          <h1 className={styles.title}>
            Ticket #{ticket.id} - 
            <span className={`${styles.estadoBadge} ${styles[ticket.estado]}`}>
              {ticket.estado}
            </span>
          </h1>

          {/* Contenedor principal con tres columnas */}
          <div className={styles.layoutContainer}>
            
            {/* Columna izquierda - Información del ticket */}
            <div className={styles.ticketInfoContainer}>
              <div className={styles.header}>
                <h3>Información del Ticket</h3>
                {!isEditing && isAdminOrTech && (
                  <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                    <FaEdit /> Editar
                  </button>
                )}
              </div>

              {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

              {isEditing ? (
                // MODO EDICIÓN
                <div className={styles.verticalForm}>
                  <h4>Datos del Ticket</h4>

                  <div className={styles.formGroup}>
                    <label>Título:</label>
                    <input
                      type="text"
                      value={editedTicket.titulo}
                      onChange={(e) => handleEditChange('titulo', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Descripción:</label>
                    <textarea
                      value={editedTicket.descripcion}
                      onChange={(e) => handleEditChange('descripcion', e.target.value)}
                      rows="4"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ubicación:</label>
                    <input
                      type="text"
                      value={editedTicket.ubicacion}
                      onChange={(e) => handleEditChange('ubicacion', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Prioridad:</label>
                    <select
                      value={editedTicket.prioridad}
                      onChange={(e) => handleEditChange('prioridad', e.target.value)}
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tipo:</label>
                    <select
                      value={editedTicket.tipo}
                      onChange={(e) => handleEditChange('tipo', e.target.value)}
                    >
                      <option value="incidencia">Incidencia</option>
                      <option value="requerimiento">Requerimiento</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Categoría:</label>
                    <select
                      value={editedTicket.id_categoria1}
                      onChange={(e) => handleEditChange('id_categoria1', e.target.value)}
                    >
                      <option value="">Seleccione categoría...</option>
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h4>Asignaciones</h4>

                  <div className={styles.formGroup}>
                    <label>Solicitante:</label>
                    <input
                      type="text"
                      value={ticket.solicitante || "Solicitante no disponible"}
                      disabled={true}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Grupo asignado:</label>
                    <select
                      value={editedTicket.id_grupo1}
                      onChange={(e) => handleEditChange('id_grupo1', e.target.value)}
                    >
                      <option value="">Seleccione grupo...</option>
                      {grupos.map(grupo => (
                        <option key={grupo.id_grupo} value={grupo.id_grupo}>
                          {grupo.nombre_grupo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Técnico asignado:</label>
                    <select
                      value={editedTicket.id_tecnico_asignado}
                      onChange={(e) => handleEditChange('id_tecnico_asignado', e.target.value)}
                      disabled={!editedTicket.id_grupo1}
                    >
                      <option value="">Seleccione técnico...</option>
                      {tecnicosPorGrupo.map(tecnico => (
                        <option key={tecnico.id_usuario} value={tecnico.id_usuario}>
                          {tecnico.nombre_completo}
                        </option>
                      ))}
                    </select>
                    {!editedTicket.id_grupo1 && (
                      <small className={styles.helpText}>Primero seleccione un grupo</small>
                    )}
                  </div>
                    
                    <div className={styles.formGroup}>
                    <label>Estado:</label>
                    <select
                      value={editedTicket.estado_ticket}
                      onChange={(e) => handleEditChange('estado_ticket', e.target.value)}
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="en-espera">En espera</option>
                      <option value="resuelto">Cerrado</option>
                    </select>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button onClick={handleSaveChanges} className={styles.saveButton}>
                      <FaSave /> Guardar Cambios
                    </button>
                    <button onClick={handleCancelEdit} className={styles.cancelButton}>
                      <FaTimes /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // MODO VISUALIZACIÓN
                <div className={styles.verticalForm}>
                  <h4>Datos del Ticket</h4>

                  <div className={styles.formGroup}>
                    <label className={styles.fecha}>Fecha de apertura:</label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeForInput(ticket.fechaApertura)}
                      disabled={true}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tipo:</label>
                    <input
                      type="text"
                      value={ticket.tipo}
                      disabled={true}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Categoría:</label>
                    <input
                      type="text"
                      value={ticket.categoria}
                      disabled={true}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Prioridad:</label>
                    <input
                      type="text"
                      value={ticket.prioridad}
                      disabled={true}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ubicación:</label>
                    <input
                      type="text"
                      value={ticket.ubicacion}
                      disabled={true}
                    />
                  </div>

                  <h4>Asignaciones</h4>

                  <div className={styles.formGroup}>
                    <label>Solicitante:</label>
                    <input
                      type="text"
                      value={ticket.solicitante || "Solicitante no disponible"}
                      disabled={true}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Asignado a:</label>
                    <input 
                      type="text" 
                      value={ticket.asignadoA || "Sin asignar"} 
                      disabled 
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Grupo asignado:</label>
                    <input 
                      type="text" 
                      value={ticket.grupoAsignado || "Sin grupo"} 
                      disabled 
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Estado:</label>
                    <input
                      type="text"
                      value={ticket.estado}
                      disabled={true}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contenedor central - contenido principal */}
            <div className={styles.mainContentContainer}>
              <div className={styles.ticketInfo}>
                <div className={styles.ticketHeader}>
                  <span className={styles.ticketTitle}>{ticket.titulo}</span>
                  <span className={styles.ticketPriority} data-priority={ticket.prioridad?.toLowerCase()}>
                    {ticket.prioridad}
                  </span>
                </div>

                <div className={styles.ticketDescription}>
                  <p>{ticket.descripcion}</p>
                </div>

                <div className={styles.ticketMeta}>
                  <div><strong>Solicitante:</strong> {ticket.solicitante || "Solicitante no disponible"}</div>
                  <div><strong>Fecha apertura:</strong> {ticket.fechaApertura}</div>
                  <div><strong>Última actualización:</strong> {ticket.ultimaActualizacion}</div>
                  <div><strong>Categoría:</strong> {ticket.categoria}</div>
                  {ticket.estado === 'resuelto' && estadoTicket.fecha_cierre && (
                    <div><strong>Fecha solución:</strong> {new Date(estadoTicket.fecha_cierre).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              {/* BOTONES PARA TÉCNICO/ADMIN */}
              {(userRole === 'tecnico' || userRole === 'administrador') && (
                <div className={styles.buttonRadioGroup}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${
                      showSeguimientoForm ? styles.active : ""
                    }`}
                    onClick={() => {
                      setShowSeguimientoForm(true);
                      setShowSolucionForm(false);
                    }}
                  >
                    <div className={styles.buttonContent}>
                      <FaRegClock className={styles.buttonIcon} />
                      <div>
                        <div className={styles.buttonTitle}>Seguimiento</div>
                        <div className={styles.buttonSubtitle}>
                          El ticket permanece abierto
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    className={`${styles.actionButton} ${
                      showSolucionForm ? styles.active : ""
                    } ${isTicketClosed ? styles.disabledButton : ""}`}
                    onClick={() => {
                      if (!isTicketClosed) {
                        setShowSolucionForm(true);
                        setShowSeguimientoForm(false);
                      }
                    }}
                    disabled={isTicketClosed}
                  >
                    <div className={styles.buttonContent}>
                      <FaCheckCircle className={styles.buttonIcon} />
                      <div>
                        <div className={styles.buttonTitle}>Solución</div>
                        <div className={styles.buttonSubtitle}>
                          {isTicketClosed ? "Ticket cerrado" : "Cerrar el ticket"}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* FORMULARIO DE SEGUIMIENTO (Técnico/Admin) */}
              {showSeguimientoForm && (userRole === 'tecnico' || userRole === 'administrador') && (
                <div className={styles.seguimientoForm}>
                  <h3>📝 Agregar Seguimiento</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Tipo de seguimiento:</label>
                    <select
                      value={nuevoSeguimiento.tipo_visita}
                      onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, tipo_visita: e.target.value})}
                    >
                      <option value="seguimiento">Seguimiento</option>
                      <option value="visita">Visita</option>
                      <option value="llamada">Llamada</option>
                      <option value="remoto">Acción remota</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Observaciones:</label>
                    <textarea
                      placeholder="Describa el seguimiento realizado..."
                      value={nuevoSeguimiento.observaciones}
                      onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, observaciones: e.target.value})}
                      className={styles.textarea}
                      rows="4"
                    />
                  </div>

                  <div className={styles.buttonGroup}>
                    <button onClick={handleAgregarSeguimiento} className={styles.submitButton}>
                      💾 Guardar Seguimiento
                    </button>
                    <button onClick={() => setShowSeguimientoForm(false)} className={styles.cancelButton}>
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* FORMULARIO DE SOLUCIÓN (Técnico/Admin) */}
              {showSolucionForm && (userRole === 'tecnico' || userRole === 'administrador') && (
                <div className={styles.solucionForm}>
                  <h3>✅ Solucionar Caso</h3>

                    <div className={styles.formGroup}>
                    <label>¿Se encontró con el usuario?</label>
                    <select
                      value={nuevoSeguimiento.encontro_usuario}
                      onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, encontro_usuario: e.target.value === 'true'})}
                    >
                      <option value={null}>No aplica</option>
                      <option value={true}>Sí</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Acciones realizadas:</label>
                    <textarea
                      placeholder="Describa detalladamente las acciones realizadas para solucionar el caso..."
                      value={nuevoSeguimiento.acciones_realizadas}
                      onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, acciones_realizadas: e.target.value})}
                      className={styles.textarea}
                      rows="4"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Observaciones finales:</label>
                    <textarea
                      placeholder="Observaciones o recomendaciones finales..."
                      value={nuevoSeguimiento.observaciones}
                      onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, observaciones: e.target.value})}
                      className={styles.textarea}
                      rows="3"
                    />
                  </div>

                  <div className={styles.buttonGroup}>
                    <button onClick={handleCerrarTicket} className={styles.cerrarButton}>
                      ✅ Cerrar Ticket
                    </button>
                    <button onClick={() => setShowSolucionForm(false)} className={styles.cancelButton}>
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* SECCIÓN DE SOLUCIÓN (Usuario) */}
              {userRole === 'usuario' && (
                <div className={styles.solucionSection}>
                  <h3>
                    <FaUserCheck className={styles.solucionIcon} />
                    Estado de tu Ticket
                  </h3>
                  
                  {ticket.estado === 'resuelto' && solucion ? (
                    <div className={styles.solucionContent}>
                      <div className={styles.solucionHeader}>
                        <span className={styles.solucionStatus}>✅ SOLUCIONADO</span>
                        <span className={styles.solucionFecha}>
                          {new Date(solucion.fecha_visita).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className={styles.solucionInfo}>
                        <p><strong>👨‍💼 Técnico:</strong> {solucion.nombre_tecnico}</p>
                        <p><strong>🛠️ Acciones realizadas:</strong></p>
                        <div className={styles.accionesBox}>
                          {solucion.acciones_realizadas}
                        </div>
                        <p><strong>📝 Observaciones:</strong></p>
                        <div className={styles.observacionesBox}>
                          {solucion.observaciones}
                        </div>
                      </div>

                      <button onClick={handleReabrirTicket} className={styles.reabrirButton}>
                        🔄 Reabrir Ticket
                      </button>
                      <Link 
                        to={`/EncuestaSatisfaccion/${ticket.id}`}
                        className={styles.encuestaButton}
                      >
                        📊 Realizar Encuesta de Satisfacción
                      </Link>
                    </div>
                  ) : ticket.estado === 'resuelto' ? (
                    <div className={styles.solucionPendiente}>
                      <p>✅ Tu ticket ha sido marcado como resuelto.</p>
                      <p>Pronto recibirás los detalles de la solución.</p>
                    </div>
                  ) : (
                    <div className={styles.solucionPendiente}>
                      <p>⏳ Tu ticket está siendo atendido por nuestro equipo técnico.</p>
                      <p>Te notificaremos cuando tengamos una solución.</p>
                    </div>
                  )}
                </div>
              )}

              {/* HISTORIAL DE SEGUIMIENTOS Y REAPERTURAS */}
              {(userRole === 'tecnico' || userRole === 'administrador' || userRole === 'usuario') && seguimientos.length > 0 && (
                <div className={styles.seguimientosSection}>
                  <h3>📋 Historial de Actividades</h3>
                  
                  <div className={styles.seguimientosList}>
                    {seguimientos.map(seg => (
                      <div key={seg.id_seguimiento} className={`${styles.seguimientoItem} ${seg.tipo_registro === 'reapertura' ? styles.reaperturaItem : ''}`}>
                        <div className={styles.seguimientoHeader}>
                          <span className={styles.seguimientoTecnico}>
                            {seg.tipo_registro === 'reapertura' ? 
                              (userRole === 'usuario' ? '👤 Tú' : '👤 Usuario') : 
                              seg.nombre_tecnico}
                          </span>
                          <span className={styles.seguimientoFecha}>
                            {new Date(seg.fecha_visita).toLocaleString()}
                          </span>
                        </div>
                        
                        {seg.tipo_registro === 'reapertura' ? (
                          <>
                            <div className={styles.seguimientoTipo}>
                              <strong>📝 Reapertura del ticket</strong>
                            </div>
                            <div className={styles.seguimientoObservaciones}>
                              <strong>Motivo:</strong> {seg.observaciones || "Usuario no conforme con la solución"}
                            </div>
                            <div className={styles.estadoCambio}>
                              <strong>Estado:</strong> Ticket reabierto para revisión
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={styles.seguimientoTipo}>
                              <strong>Tipo:</strong> {seg.tipo_visita}
                            </div>
                            <div className={styles.seguimientoObservaciones}>
                              <strong>Observaciones:</strong> {seg.observaciones}
                            </div>
                            {seg.acciones_realizadas && (
                              <div className={styles.seguimientoAcciones}>
                                <strong>Acciones:</strong> {seg.acciones_realizadas}
                              </div>
                            )}
                            {seg.estado_resultante && (
                              <div className={styles.estadoCambio}>
                                <strong>Estado resultante:</strong> {seg.estado_resultante}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Columna derecha - Opciones adicionales */}
            <div className={styles.optionsColumn}>
              <div className={styles.optionsContainer}>
                <h3>Opciones del Ticket</h3>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Casos</label>
                  <div className={styles.optionContent}>
                    <Link
                      to="/tickets/solucion/:id"
                      className={styles.optionLink}
                    >
                      Caso Actual
                    </Link>
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>
                    Encuesta de satisfacción
                  </label>
                  <div className={styles.optionContent}>
                    <Link
                      to="/EncuestaSatisfaccion/:surveyId"
                      className={styles.optionLink}
                    >
                      Encuesta
                    </Link>
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Histórico</label>
                  <div className={styles.optionContent}>
                    <Link
                      to={`/tickets/${ticket.id}/historial`}
                      className={styles.optionLink}
                    >
                      <FaHistory /> Historial
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <div className={styles.chatbotContainer}>
        <img
          src={ChatbotIcon}
          alt="Chatbot"
          className={styles.chatbotIcon}
          onClick={toggleChat}
        />
        {isChatOpen && (
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <h4>Chat de Soporte</h4>
              <button onClick={toggleChat} className={styles.closeChat}>
                &times;
              </button>
            </div>
            <div className={styles.chatBody}>
              <p>Bienvenido al chat de soporte. ¿En qué podemos ayudarte?</p>
            </div>
            <div className={styles.chatInput}>
              <input type="text" placeholder="Escribe un mensaje..." />
              <button>Enviar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolucionTickets;
