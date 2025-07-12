import React, { useState, useEffect } from "react";
import { Outlet, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import axios from 'axios';
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/CrearCasoAdmin.module.css";

const CrearCasoAdmin = () => {
  // Obtener datos del usuario
  const userRole = localStorage.getItem("rol") || "";
  const nombre = localStorage.getItem("nombre") || "";

  // Estados
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [ticket, setTicket] = useState({
    entidad: '',
    titulo: '',
    descripcion: '',
    archivos: [],
    id: '',
    solicitante: '',
    prioridad: '',
    estado: '',
    tecnico: '',
    grupo: '',
    categoria: '',
    fechaApertura: '',
    ultimaActualizacion: '',
    tipo: 'incidencia',
    ubicacion: '',
    observador: '',
    asignadoA: '',
    grupoAsignado: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const navigate = useNavigate();

  // Verificación de rol
  const isAdminOrTech = userRole === "administrador" || userRole === "tecnico";

  if (!isAdminOrTech) {
    return (
      <div className={styles.accessDenied}>
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <Link to="/" className={styles.returnLink}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Handlers
  const toggleChat = () => setIsChatOpen(!isChatOpen);

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




  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/Tickets?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };


  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setTicket(prev => ({ ...prev, archivos: [...prev.archivos, ...files] }));
  };

  const removeFile = (index) => {
    setTicket(prev => {
      const newFiles = [...prev.archivos];
      newFiles.splice(index, 1);
      return { ...prev, archivos: newFiles };
    });
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("prioridad", formData.prioridad);
      formDataToSend.append("estado", formData.estado);
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("solicitante", formData.solicitante);
      formDataToSend.append("observador", formData.observador);
      formDataToSend.append("asignado a", formData.asignado_a);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("grupo asignado", formData.grupo_asignado);
      formDataToSend.append("origen", formData.origen);
      formDataToSend.append("tipo", formData.tipo);
      formDataToSend.append("categoria", formData.categoria);

      if (formData.archivo) {
        formDataToSend.append("archivo", formData.archivo);
      }

      if (location.state?.mode === "edit") {
        await axios.put(
          `http://localhost:5000/usuarios/tickets${formData.id}`,
          formDataToSend,
          {}
        );
        setSuccess("Ticket actualizado correctamente");
      } else {
        await axios.post(
          "http://localhost:5000/usuarios/tickets",
          formDataToSend,
          {}
        );
        setSuccess("Ticket creado correctamente");
      }

      setTimeout(() => navigate("/Tickets"), 2000);
    } catch (error) {
      console.error("Error al procesar el ticket:", error);
      setError(
        error.response?.data?.detail || "Error al procesar la solicitud"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Validación del formulario
  const validateForm = () => {
    return (
      formData.tipo &&
      formData.origen &&
      formData.prioridad &&
      formData.categoria &&
      formData.titulo &&
      formData.descripcion &&
      formData.solicitante
    );
  };


  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/Tickets'); // Redirige a la página de tickets
  };


  // Estado del formulario
  const [formData, setFormData] = useState({
    id: "",
    tipo: "",
    origen: "",
    prioridad: "",
    categoria: "",
    titulo: "",
    descripcion: "",
    archivo: null,
    solicitante: nombre || "",
    elementos: "",
  });

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.substring(0, 16);

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Obtener datos iniciales al cargar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Obtener usuarios
        const usuariosResponse = await axios.get(
          "http://localhost:5000/usuarios/obtener"
        );
        setUsuarios(usuariosResponse.data);

        // Obtener entidades
        const deptosResponse = await axios.get(
          "http://localhost:5000/usuarios/obtenerEntidades"
        );
        setDepartamentos(deptosResponse.data);

        // Obtener categorías
        const catsResponse = await axios.get(
          "http://localhost:5000/usuarios/obtenerCategorias"
        );
        setCategorias(catsResponse.data);

        // Obtener grupos
        const grupoResponse = await axios.get(
          "http://localhost:5000/usuarios/obtenerGrupos"
        );
        setGrupos(grupoResponse.data);


        // Cargar datos del ticket si estamos en modo edición
        if (location.state?.ticketData) {
          setFormData((prev) => ({
            ...prev,
            ...location.state.ticketData,
          }));
        }
      } catch (error) {
        console.error("Error al obtener datos iniciales:", error);
        
      }
    };

    fetchInitialData();
  }, [location.state]);

  if (loading) {
    return <div className={styles.loading}>Cargando ticket...</div>;
  }

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
    } else if (section === "tickets") {
      // Todos los roles van a la misma ruta de tickets en tu caso
      return "/Tickets";
    }
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
              <Link to="/Tickets" className={styles.linkSinSubrayado}>
                <FcAnswers className={styles.menuIcon} />
                <span className={styles.menuText}>Tickets</span>
              </Link>
            </li>

            <li className={styles.iconosMenu}>
              <Link to="/CrearCasoUse" className={styles.linkSinSubrayado}>
                <FcCustomerSupport className={styles.menuIcon} />
                <span className={styles.menuText}>Crear Caso</span>
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
      <div style={{ marginLeft: isMenuExpanded ? "200px" : "60px", transition: "margin-left 0.3s ease" }}>
        <Outlet />
      </div>

      {/* Header */}
      <header className={styles.containerInicio} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        <div className={styles.containerInicioImg}>
          <Link to="/homeAdmiPage" className={styles.linkSinSubrayado}>
            <span>Inicio</span>
          </Link>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.searchContainer}>
            <input className={styles.search} type="text" placeholder="Buscar..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className={styles.buttonBuscar} title="Buscar"
              disabled={isLoading || !searchTerm.trim()}>
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
            {isLoading && <span className={styles.loading}>Buscando...</span>}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.userContainer}>
            <span className={styles.username}>Bienvenido, <span id="nombreusuario">{nombre}</span></span>
            <div className={styles.iconContainer}>
              <Link to="/"><FaPowerOff className={styles.icon} /></Link>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.containerCrearCasoAdmin} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>

        <div className={styles.containersolucion}>
          <h1 className={styles.title}>Creación de Ticket</h1>


          <div className={styles.layoutContainer}>

            <div className={styles.gloBoContainer}>
              <div className={styles.gloBoHeader}>
                <h2>Crear Nuevo Caso</h2>
              </div>

              <div className={styles.gloBoBody}>
                <div className={styles.formGroup}>
                  <label>Entidad:*</label>
                  <select className={styles.inputField} value={ticket.entidad}
                    name="entidad" onChange={handleChange}>
                    <option value="">Seleccione una entidad</option>
                    <option value="Contabilidad">Contabilidad</option>
                    <option value="Talento Humano">Talento Humano</option>
                    <option value="Almacen">Almacen</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Título*</label>
                  <input
                    className={styles.inputField}
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Descripción*</label>
                  <textarea className={styles.inputField}
                    placeholder="Describa el caso detalladamente"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="5"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Adjuntar archivos:</label>
                  <div className={styles.fileUploadContainer}>
                    <input type="file" id="fileUpload" className={styles.fileInput}
                      onChange={handleFileUpload} multiple />
                    <label htmlFor="fileUpload" className={styles.fileUploadButton}>
                      Seleccionar archivos
                    </label>
                    {ticket.archivos?.length > 0 && (
                      <div className={styles.fileList}>
                        {ticket.archivos.map((file, index) => (
                          <div key={index} className={styles.fileItem}>
                            <span>{file.name}</span>
                            <button type="button" onClick={() => removeFile(index)}
                              className={styles.removeFileButton}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.submitButton} onClick={handleSubmit}>
                    Crear Ticket
                  </button>
                </div>
              </div>
              <div className={styles.gloBoPointer}></div>
            </div>
            {/* Modal de éxito */}
            {showSuccessModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.successModal}>
                  <h3>¡Ticket creado exitosamente!</h3>
                  <p>El ticket fue creado con el número: <strong>{createdTicketId}</strong></p>
                  <button
                    onClick={handleCloseModal}
                    className={styles.modalButton}
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            )}


            <div className={styles.ticketInfoContainer}>
              <div className={styles.header}>
                <h3>Información del Ticket</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                    Editar
                  </button>
                )}
              </div>

              {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

              <div className={styles.verticalForm}>
                <h4>Casos</h4>

                <div className={styles.formGroup}>
                  <label className={styles.fecha}>Fecha de apertura*</label>
                  <input type="datetime-local" name="fechaApertura"
                    value={formatDateTimeForInput(ticket.fechaApertura)}
                    onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <label>Tipo*</label>
                  <select
                    name="tipo"
                    value={ticket.tipo}
                    onChange={handleChange}
                    required>
                    <option value="incidencia">Incidencia</option>
                    <option value="requerimiento">Requerimiento</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Categoría*</label>
                  <select

                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
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
                  <label>Estado*</label>
                  <select name="estado" value={ticket.estado}
                    onChange={handleChange} required>
                    <option value="nuevo">Nuevo</option>
                    <option value="en-curso">En curso</option>
                    <option value="en-espera">En espera</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Prioridad*</label>
                  <select name="prioridad" value={formData.prioridad}
                    onChange={handleChange} required>
                    <option value="alta">Alta</option>
                    <option value="mediana">Mediana</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Ubicación*</label>
                  <input type="text" name="ubicacion" value={formData.ubicacion}
                    onChange={handleChange} required />
                </div>

                <h4>Asignaciones</h4>

                <div className={styles.formGroup}>
                  <label>Solicitante*</label>
                  <select
                    name="solicitante"
                    value={formData.solicitante}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un usuario...</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {`${usuario.nombre_completo}`} ({usuario.correo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Observador*</label>
                  <select
                    name="observador"
                    value={formData.observador}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un usuario...</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {`${usuario.nombre_completo}`} ({usuario.correo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Grupo asignado*</label>
                  <select
                    name="grupo_asignado"
                    value={formData.grupo_asignado}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un grupo...</option>
                    {grupos.map(grupo => (
                      <option key={grupo.id_grupo} value={grupo.id_grupo}>
                        {`${grupo.nombre_completo}`} ({usuario.correo})
                      </option>
                    ))}
                  </select>
                </div>


                <div className={styles.formGroup}>
                  <label>Asignado a*</label>
                  <select
                    name="asignado_a"
                    value={formData.asignado_a}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un usuario...</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {`${usuario.nombre_completo}`} ({usuario.correo})
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {isEditing && (
                <div className={styles.actions}>
                  <button onClick={handleSave} className={styles.saveButton}>
                    Guardar Cambios
                  </button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <div className={styles.chatbotContainer}>
        <img src={ChatbotIcon} alt="Chatbot" className={styles.chatbotIcon} onClick={toggleChat} />
        {isChatOpen && (
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <h4>Chat de Soporte</h4>
              <button onClick={toggleChat} className={styles.closeChat}>&times;</button>
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
    </div >
  );
};

export default CrearCasoAdmin;