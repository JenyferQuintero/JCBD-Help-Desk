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
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener datos del ticket y relacionados
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Obtener datos del ticket
        const ticketRes = await axios.get(
          `http://localhost:5000/usuarios/tickets/${id}`
        );
        console.log("Ticket recibido:", ticketRes.data);
        setTicket(ticketRes.data);

        const categoriasRes = await axios.get(
          "http://localhost:5000/usuarios/obtenerCategorias"
        );
        setCategorias(categoriasRes.data);

        // Obtener datos relacionados
        /*const [casosRes, seguimientosRes, categoriasRes, gruposRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/tickets/relacionados/${id}`),
          axios.get(`http://localhost:5000/api/tickets/${id}/seguimientos`),
          axios.get('http://localhost:5000/usuarios/obtenerCategorias'),
          axios.get('http://localhost:5000/api/grupos')
        ]);

        setCasos(casosRes.data);
        setSeguimientos(seguimientosRes.data);
        setCategorias(categoriasRes.data);
        setGrupos(gruposRes.data);*/

        // Si es admin o técnico, obtener lista de técnicos
        /*const userRole = localStorage.getItem("rol");
        if (['admin', 'tecnico'].includes(userRole)) {
          const tecnicosRes = await axios.get('http://localhost:5000/api/tecnicos');
          setTecnicos(tecnicosRes.data);
        }*/

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // Datos de ejemplo en caso de error
        setTicket({
          id: id || "TKT-001",
          titulo: "Problema con el sistema de impresión",
          descripcion:
            "El sistema no imprime correctamente los documentos largos",
          solicitante: "Usuario Ejemplo",
          prioridad: "Alta",
          estado: "Abierto",
          tecnico: "Técnico Asignado",
          grupo: "Soporte Técnico",
          categoria: "Hardware",
          fechaApertura: "2023-05-10 09:30:00",
          ultimaActualizacion: "2023-05-12 14:15:00",
          tipo: "incidencia",
          ubicacion: "Oficina Central",
          observador: "",
          asignadoA: "Técnico Asignado",
          grupoAsignado: "Soporte Técnico",
        });
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleAgregarSeguimiento = async () => {
    if (!nuevoSeguimiento.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/tickets/${id}/seguimientos`, {
        descripcion: nuevoSeguimiento,
        usuario: localStorage.getItem("nombre"),
      });

      const response = await axios.get(
        `http://localhost:5000/api/tickets/${id}/seguimientos`
      );
      setSeguimientos(response.data);
      setNuevoSeguimiento("");
    } catch (error) {
      console.error("Error al agregar seguimiento:", error);
    }
  };

  const roleToPath = {
    usuario: "/home",
    tecnico: "/HomeTecnicoPage",
    administrador: "/HomeAdmiPage",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!solucion.trim()) {
      alert("Por favor ingrese la solución");
      return;
    }

    console.log({
      ticketId: id,
      solucion,
      accion,
      fecha: new Date().toISOString(),
    });

    if (accion === "solucion") {
      alert(
        "Solución guardada. El ticket se ha cerrado y se enviará una encuesta de satisfacción."
      );
      navigate(`/EncuestaSatisfaccion/${id}`);
    } else {
      alert("Seguimiento guardado. El ticket permanece abierto.");
    }

    navigate("/Tickets");
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    alert(
      `Encuesta enviada: ${surveyRating} estrellas, Comentario: ${surveyComment}`
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Manejo especial para campos de fecha/hora
    if (name === "fechaApertura") {
      // Convertir a formato ISO para almacenamiento
      const isoDate = value ? new Date(value).toISOString() : "";
      setTicket((prev) => ({ ...prev, [name]: isoDate }));
    } else {
      setTicket((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${id}`, ticket);
      setSuccessMessage("Cambios guardados correctamente");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al guardar cambios");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      // Aquí va lógica de búsqueda con axios

      navigate(`/Tickets?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    } catch (error) {
      setError("Error al realizar la búsqueda");
      console.error("Error en búsqueda:", error);
      // Manejar el error si es necesario
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers del menú
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol");
  const isAdminOrTech = ["admin", "tecnico"].includes(userRole);

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

  if (loading) {
    return <div className={styles.loading}>Cargando ticket...</div>;
  }

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";

    // Si ya está en el formato correcto (desde la API)
    if (dateString.includes("T")) {
      return dateString.substring(0, 16); // Tomamos solo la parte relevante
    }

    // Si viene como string de fecha ISO
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Si no es una fecha válida

    // Formatear a YYYY-MM-DDTHH:MM
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
    } if (section === "tickets") return "/Tickets";
        return "/";
      };
    
      // Renderizar menú según el rol
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

      <div
        className={styles.containerColumnas}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.containersolucion}>
          <h1 className={styles.title}>Solución del Ticket #{ticket.id}</h1>

          {/* Contenedor principal con tres columnas */}
          <div className={styles.layoutContainer}>
            {/* Columna izquierda - Opciones adicionales */}
            <div className={styles.ticketInfoContainer}>
              <div className={styles.header}>
                <h3>Información del Ticket</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                  >
                    Editar
                  </button>
                )}
              </div>

              {successMessage && (
                <div className={styles.successMessage}>{successMessage}</div>
              )}

              {/* Sección 1: Datos principales */}
              <div className={styles.verticalForm}>
                <h4>Datos del Ticket</h4>

                <div className={styles.formGroup}>
                  <label className={styles.fecha}>Fecha de apertura:</label>
                  <input
                    type="datetime-local"
                    name="fechaApertura"
                    value={formatDateTimeForInput(ticket.fechaApertura)}
                    onChange={handleChange}
                    disabled={!isEditing || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tipo:</label>
                  <select
                    name="tipo"
                    value={ticket.tipo}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                  <option value="">Seleccione...</option>
                    {categorias?.map(categoria => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Estado:</label>
                  <select
                    name="estado"
                    value={ticket.estado}
                    onChange={handleChange}
                    disabled={!isEditing || !isAdminOrTech}
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="en-curso">En curso</option>
                    <option value="en-espera">En espera</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Prioridad:</label>
                  <select
                    name="prioridad"
                    value={ticket.prioridad}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="alta">Alta</option>
                    <option value="mediana">Mediana</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Ubicación:</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={ticket.ubicacion}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    disabled={!isEditing || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Observador:</label>
                  <input
                    type="text"
                    name="observador"
                    value={ticket.observador}
                    onChange={handleChange}
                    disabled={!isEditing || !isAdminOrTech}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Asignado a:</label>
                  {isAdminOrTech ? (
                    <select
                      name="asignadoA"
                      value={ticket.asignadoA}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Seleccionar técnico</option>
                      {tecnicos.map((tec) => (
                        <option key={tec.id} value={tec.nombre}>
                          {tec.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={ticket.asignadoA} disabled />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Grupo asignado:</label>
                  {isAdminOrTech ? (
                    <select
                      name="grupoAsignado"
                      value={ticket.grupoAsignado}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Seleccionar grupo</option>
                      {grupos.map((grupo) => (
                        <option key={grupo.id} value={grupo.nombre}>
                          {grupo.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={ticket.grupoAsignado} disabled />
                  )}
                </div>
              </div>

              {isEditing && (
                <div className={styles.actions}>
                  <button onClick={handleSave} className={styles.saveButton}>
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/*contenedor central - contenido principal*/}
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
                    <strong>Fecha apertura:</strong> {ticket.fechaApertura}
                  </div>
                  <div>
                    <strong>Última actualización:</strong>{" "}
                    {ticket.ultimaActualizacion}
                  </div>
                  <div>
                    <strong>Categoría:</strong> {ticket.categoria}
                  </div>
                </div>
              </div>

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
                  {(userRole === "admin" || userRole === "tecnico") && (
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
                          <div className={styles.buttonSubtitle}></div>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Container para la solución */}
              <form onSubmit={handleSubmit} className={styles.solutionForm}>
                <h2 className={styles.solutionTitle}>Seguimiento </h2>

                <div className={styles.formGroup}>
                  <label htmlFor="solucion" className={styles.label}>
                    Detalle de la solución o seguimiento:
                  </label>
                  <textarea
                    id="solucion"
                    value={solucion}
                    onChange={(e) => setSolucion(e.target.value)}
                    required
                    className={styles.textarea}
                    placeholder="Describa la solución aplicada o los pasos realizados..."
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.submitButton}>
                    {accion === "solucion"
                      ? "Cerrar Ticket con Solución"
                      : "Guardar Seguimiento"}
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
