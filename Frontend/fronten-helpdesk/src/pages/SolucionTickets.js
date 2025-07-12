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
import { FaRegClock, FaCheckCircle, FaHistory } from "react-icons/fa";
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
  const [solucion, setSolucion] = useState("");
  const [accion, setAccion] = useState("seguimiento");
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
  });
  const [surveyEnabled, setSurveyEnabled] = useState(false);
  const [surveyRating, setSurveyRating] = useState(0);
  const [surveyComment, setSurveyComment] = useState("");
  const [casos, setCasos] = useState([]);
  const [casoActual, setCasoActual] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Obtener datos del usuario y validar autenticación
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol");
  const isAdminOrTech = ["admin", "tecnico"].includes(userRole);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    if (!nombre) {
      navigate("/login");
    }
  }, [nombre, navigate]);

  // Obtener datos del ticket y relacionados
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos del ticket
        const ticketRes = await axios.get(
          `http://localhost:5000/api/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        if (ticketRes.data.estado === "cerrado") {
          setSurveyEnabled(true);
        }

        setTicket(ticketRes.data);

        // Obtener datos relacionados
        const [categoriasRes, gruposRes, seguimientosRes, tecnicosRes] = await Promise.all([
          axios.get("http://localhost:5000/api/categorias", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }),
          axios.get("http://localhost:5000/api/grupos", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }),
          axios.get(`http://localhost:5000/api/tickets/${id}/seguimientos`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }),
          isAdminOrTech ? 
            axios.get("http://localhost:5000/api/tecnicos", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            }) 
            : Promise.resolve({data: []})
        ]);

        setCategorias(categoriasRes.data);
        setGrupos(gruposRes.data);
        setSeguimientos(seguimientosRes.data);
        setTecnicos(tecnicosRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar los datos del ticket");
        setLoading(false);
        
        if (error.response?.status === 401) {
          navigate("/login");
        } else if (error.response?.status === 403) {
          navigate("/no-autorizado");
        }
      }
    };

    fetchAllData();
  }, [id, isAdminOrTech, navigate]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!solucion.trim()) {
      errors.solucion = "Este campo es requerido";
    }
    
    if (solucion.length > 1000) {
      errors.solucion = "El texto no puede exceder los 1000 caracteres";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Enviar la solución/seguimiento al backend
      await axios.post(
        `http://localhost:5000/api/tickets/${id}/seguimientos`,
        {
          descripcion: solucion,
          accion,
          usuario: nombre,
          rol: userRole
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (accion === "solucion" && isAdminOrTech) {
        // Cerrar el ticket si es solución y el usuario tiene permisos
        await axios.put(
          `http://localhost:5000/api/tickets/${id}/estado`,
          { estado: "cerrado" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        // Registrar el cierre en el historial
        await axios.post(
          `http://localhost:5000/api/tickets/${id}/historial`,
          {
            usuario: nombre,
            accion: "Cierre de ticket",
            cambios: `Ticket cerrado por ${nombre}`
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        // Redirigir a encuesta de satisfacción
        navigate(`/EncuestaSatisfaccion/${id}`);
      } else {
        // Actualizar la lista de seguimientos
        const response = await axios.get(
          `http://localhost:5000/api/tickets/${id}/seguimientos`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        setSeguimientos(response.data);
        setSolucion("");
        
        // Mostrar mensaje de éxito
        setSuccessMessage(
          accion === "solucion" 
            ? "Solución enviada para revisión" 
            : "Seguimiento guardado correctamente"
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error al guardar solución/seguimiento:", error);
      setError(
        error.response?.data?.message || 
        "Ocurrió un error al procesar la solicitud"
      );
      
      if (error.response?.status === 401) {
        navigate("/login");
      } else if (error.response?.status === 403) {
        setError("No tiene permisos para realizar esta acción");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el guardado de ediciones
  const handleSave = async () => {
    try {
      if (!validateForm()) return;
      
      setIsLoading(true);
      
      // Validar campos según rol
      const cambiosPermitidos = { ...ticket };
      
      // Usuarios normales solo pueden editar ciertos campos
      if (!isAdminOrTech) {
        cambiosPermitidos.prioridad = ticket.prioridad;
        cambiosPermitidos.categoria = ticket.categoria;
        cambiosPermitidos.descripcion = ticket.descripcion;
      }
      
      await axios.put(
        `http://localhost:5000/api/tickets/${id}`,
        cambiosPermitidos,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Registrar el cambio en el historial
      await axios.post(
        `http://localhost:5000/api/tickets/${id}/historial`,
        {
          usuario: nombre,
          accion: "Edición de ticket",
          cambios: JSON.stringify(cambiosPermitidos)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setSuccessMessage("Cambios guardados correctamente");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setError(
        error.response?.data?.message || 
        "Error al guardar los cambios"
      );
      
      if (error.response?.status === 401) {
        navigate("/login");
      } else if (error.response?.status === 403) {
        setError("No tiene permisos para editar este ticket");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha para inputs
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const pad = (num) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Navegación según rol
  const getRouteByRole = (section) => {
    if (section === "inicio") {
      if (userRole === "administrador") {
        return "/HomeAdmiPage";
      } else if (userRole === "tecnico") {
        return "/HomeTecnicoPage";
      } else {
        return "/home";
      }
    } else if (section === "crear-caso") {
      if (userRole === "administrador") {
        return "/CrearCasoAdmin";
      } else if (userRole === "tecnico") {
        return "/CrearCasoAdmin";
      } else {
        return "/CrearCasoUse";
      }
    } else if (section === "tickets") {
      return "/Tickets";
    }
    return "/";
  };

  // Renderizar menú según el rol
  const renderMenuByRole = () => {
    switch (userRole) {
      case "administrador":
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

      case "tecnico":
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

      case "usuario":
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando información del ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate("/Tickets")} 
          className={styles.backButton}
        >
          Volver a Tickets
        </button>
      </div>
    );
  }

  return (
    <div className={styles.containerPrincipal}>
      {/* Menú Vertical */}
      <aside
        className={`${styles.menuVertical} ${isMenuExpanded ? styles.expanded : ""}`}
        onMouseEnter={toggleMenu}
        onMouseLeave={toggleMenu}
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

      {/* Contenido principal */}
      <div
        style={{
          marginLeft: isMenuExpanded ? "200px" : "60px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </div>

      {/* Header */}
      <header
        className={styles.containerInicio}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.containerInicioImg}>
          <Link
            to={getRouteByRole("inicio")}
            className={styles.linkSinSubrayado}
          >
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
            <button
              className={styles.buttonBuscar}
              title="Buscar"
              disabled={isLoading || !searchTerm.trim()}
            >
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
            {isLoading && <span className={styles.loading}>Buscando...</span>}
          </div>

          <div className={styles.userContainer}>
            <span className={styles.username}>
              Bienvenido, <span id="nombreusuario">{nombre}</span>
            </span>
            <div className={styles.iconContainer}>
              <Link to="/logout">
                <FaPowerOff className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div
        className={styles.containerColumnas}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.containersolucion}>
          <h1 className={styles.title}>
            {ticket.estado === "cerrado" ? "Ticket Cerrado" : "Solución del Ticket"} #{ticket.id}
          </h1>

          {/* Contenedor principal con tres columnas */}
          <div className={styles.layoutContainer}>
            {/* Columna izquierda - Información del ticket */}
            <div className={styles.ticketInfoContainer}>
              <div className={styles.header}>
                <h3>Información del Ticket</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                    disabled={ticket.estado === "cerrado"}
                  >
                    Editar
                  </button>
                )}
              </div>

              {successMessage && (
                <div className={styles.successMessage}>{successMessage}</div>
              )}

              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}

              {/* Sección 1: Datos principales */}
              <div className={styles.verticalForm}>
                <h4>Datos del Ticket</h4>

                <div className={styles.formGroup}>
                  <label>Fecha de apertura:</label>
                  <input
                    type="datetime-local"
                    name="fechaApertura"
                    value={formatDateTimeForInput(ticket.fechaApertura)}
                    onChange={(e) => setTicket({...ticket, fechaApertura: e.target.value})}
                    disabled={!isEditing || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tipo:</label>
                  <select
                    name="tipo"
                    value={ticket.tipo}
                    onChange={(e) => setTicket({...ticket, tipo: e.target.value})}
                    disabled={!isEditing || !isAdminOrTech}
                  >
                    <option value="incidencia">Incidencia</option>
                    <option value="requerimiento">Requerimiento</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Categoría:</label>
                  <select
                    name="categoria"
                    value={ticket.categoria}
                    onChange={(e) => setTicket({...ticket, categoria: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="">Seleccione...</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.nombre}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Estado:</label>
                  <select
                    name="estado"
                    value={ticket.estado}
                    onChange={(e) => setTicket({...ticket, estado: e.target.value})}
                    disabled={!isEditing || !isAdminOrTech || ticket.estado === "cerrado"}
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="en-curso">En curso</option>
                    <option value="en-espera">En espera</option>
                    {isAdminOrTech && (
                      <>
                        <option value="resuelto">Resuelto</option>
                        <option value="cerrado">Cerrado</option>
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Prioridad:</label>
                  <select
                    name="prioridad"
                    value={ticket.prioridad}
                    onChange={(e) => setTicket({...ticket, prioridad: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Ubicación:</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={ticket.ubicacion}
                    onChange={(e) => setTicket({...ticket, ubicacion: e.target.value})}
                    disabled={!isEditing || !isAdminOrTech}
                  />
                </div>

                <h4>Asignaciones</h4>

                <div className={styles.formGroup}>
                  <label>Solicitante:</label>
                  <input
                    type="text"
                    name="solicitante"
                    value={ticket.solicitante}
                    onChange={(e) => setTicket({...ticket, solicitante: e.target.value})}
                    disabled={!isEditing || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Observador:</label>
                  <input
                    type="text"
                    name="observador"
                    value={ticket.observador}
                    onChange={(e) => setTicket({...ticket, observador: e.target.value})}
                    disabled={!isEditing || !isAdminOrTech}
                  />
                </div>

                {isAdminOrTech && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Asignado a:</label>
                      <select
                        name="asignadoA"
                        value={ticket.asignadoA}
                        onChange={(e) => setTicket({...ticket, asignadoA: e.target.value})}
                        disabled={!isEditing}
                      >
                        <option value="">Seleccionar técnico</option>
                        {tecnicos.map((tec) => (
                          <option key={tec.id} value={tec.nombre}>
                            {tec.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Grupo asignado:</label>
                      <select
                        name="grupoAsignado"
                        value={ticket.grupoAsignado}
                        onChange={(e) => setTicket({...ticket, grupoAsignado: e.target.value})}
                        disabled={!isEditing}
                      >
                        <option value="">Seleccionar grupo</option>
                        {grupos.map((grupo) => (
                          <option key={grupo.id} value={grupo.nombre}>
                            {grupo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <div className={styles.actions}>
                  <button 
                    onClick={handleSave} 
                    className={styles.saveButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className={styles.loadingSpinner}></span> Guardando...
                      </>
                    ) : "Guardar Cambios"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Recuperar datos originales
                      axios.get(`http://localhost:5000/api/tickets/${id}`, {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                      })
                      .then(res => setTicket(res.data))
                      .catch(console.error);
                    }}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Contenedor central - Formulario de solución/seguimiento */}
            <div className={styles.mainContentContainer}>
              <div className={styles.ticketInfo}>
                <div className={styles.ticketHeader}>
                  <span className={styles.ticketTitle}>{ticket.titulo}</span>
                  <span
                    className={styles.ticketPriority}
                    data-priority={ticket.prioridad.toLowerCase()}
                  >
                    {ticket.prioridad}
                  </span>
                </div>

                <div className={styles.ticketDescription}>
                  <p>{ticket.descripcion}</p>
                </div>

                <div className={styles.ticketMeta}>
                  <div>
                    <strong>Solicitante:</strong> {ticket.solicitante}
                  </div>
                  <div>
                    <strong>Fecha apertura:</strong> {new Date(ticket.fechaApertura).toLocaleString()}
                  </div>
                  <div>
                    <strong>Última actualización:</strong> {new Date(ticket.ultimaActualizacion).toLocaleString()}
                  </div>
                  <div>
                    <strong>Categoría:</strong> {ticket.categoria}
                  </div>
                  <div>
                    <strong>Estado:</strong> <span className={styles[ticket.estado]}>{ticket.estado}</span>
                  </div>
                </div>
              </div>

              {/* Solo mostrar acciones si el ticket no está cerrado */}
              {ticket.estado !== "cerrado" && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Acción a realizar:</label>
                    <div className={styles.buttonRadioGroup}>
                      <button
                        type="button"
                        className={`${styles.actionButton} ${
                          accion === "seguimiento" ? styles.active : ""
                        }`}
                        onClick={() => setAccion("seguimiento")}
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

                      {/* Botón de Solución - solo visible para admin y técnico */}
                      {isAdminOrTech && (
                        <button
                          type="button"
                          className={`${styles.actionButton} ${
                            accion === "solucion" ? styles.active : ""
                          }`}
                          onClick={() => setAccion("solucion")}
                        >
                          <div className={styles.buttonContent}>
                            <FaCheckCircle className={styles.buttonIcon} />
                            <div>
                              <div className={styles.buttonTitle}>Solución</div>
                              <div className={styles.buttonSubtitle}>
                                Cierra el ticket y envía encuesta
                              </div>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulario de solución/seguimiento */}
                  <form onSubmit={handleSubmit} className={styles.solutionForm}>
                    <h2 className={styles.solutionTitle}>
                      {accion === "solucion" ? "Solución Final" : "Seguimiento"}
                    </h2>

                    <div className={styles.formGroup}>
                      <label htmlFor="solucion" className={styles.label}>
                        {accion === "solucion"
                          ? "Detalle de la solución aplicada:"
                          : "Detalle del seguimiento:"}
                        <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        id="solucion"
                        value={solucion}
                        onChange={(e) => setSolucion(e.target.value)}
                        required
                        className={`${styles.textarea} ${
                          validationErrors.solucion ? styles.errorInput : ""
                        }`}
                        placeholder={
                          accion === "solucion"
                            ? "Describa la solución aplicada..."
                            : "Describa los pasos realizados..."
                        }
                      />
                      {validationErrors.solucion && (
                        <span className={styles.errorText}>
                          {validationErrors.solucion}
                        </span>
                      )}
                    </div>

                    <div className={styles.buttonGroup}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className={styles.loadingSpinner}></span> Procesando...
                          </>
                        ) : accion === "solucion" ? (
                          "Cerrar Ticket con Solución"
                        ) : (
                          "Guardar Seguimiento"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/Tickets")}
                        className={styles.cancelButton}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Mostrar mensaje si el ticket está cerrado */}
              {ticket.estado === "cerrado" && (
                <div className={styles.closedTicketMessage}>
                  <h3>Este ticket ha sido cerrado</h3>
                  <p>
                    {ticket.solucion
                      ? `Solución aplicada: ${ticket.solucion}`
                      : "No se registró una solución específica."}
                  </p>
                  <p>
                    Cerrado por: {ticket.cerradoPor || "Sistema"} el{" "}
                    {new Date(ticket.fechaCierre).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Columna derecha - Opciones adicionales */}
            <div className={styles.optionsColumn}>
              <div className={styles.optionsContainer}>
                <h3>Opciones del Ticket</h3>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Historial</label>
                  <div className={styles.optionContent}>
                    <Link
                      to={`/tickets/${id}/historial`}
                      className={styles.optionLink}
                    >
                      <FaHistory /> Ver Historial
                    </Link>
                  </div>
                </div>

                {ticket.estado === "cerrado" && (
                  <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>
                      Encuesta de satisfacción
                    </label>
                    <div className={styles.optionContent}>
                      {surveyEnabled ? (
                        <Link
                          to={`/EncuestaSatisfaccion/${id}`}
                          className={styles.optionLink}
                        >
                          Completar Encuesta
                        </Link>
                      ) : (
                        <p className={styles.optionText}>
                          Encuesta ya completada
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Documentación</label>
                  <div className={styles.optionContent}>
                    <p className={styles.optionText}>
                      Adjuntos: {ticket.adjuntos || "Ninguno"}
                    </p>
                  </div>
                </div>

                {seguimientos.length > 0 && (
                  <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>Últimos Seguimientos</label>
                    <div className={styles.optionContent}>
                      <div className={styles.seguimientosList}>
                        {seguimientos.slice(0, 3).map((seg, index) => (
                          <div key={index} className={styles.seguimientoItem}>
                            <p className={styles.seguimientoFecha}>
                              {new Date(seg.fecha).toLocaleString()}
                            </p>
                            <p className={styles.seguimientoTexto}>
                              {seg.descripcion.length > 50
                                ? `${seg.descripcion.substring(0, 50)}...`
                                : seg.descripcion}
                            </p>
                          </div>
                        ))}
                      </div>
                      {seguimientos.length > 3 && (
                        <Link
                          to={`/tickets/${id}/historial`}
                          className={styles.optionLinkSmall}
                        >
                          Ver todos ({seguimientos.length})
                        </Link>
                      )}
                    </div>
                  </div>
                )}
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