import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import {
  FcEmptyFilter,
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
  FcPrint,
} from "react-icons/fc";
import {
  FaFileExcel,
  FaFilePdf,
  FaFileCsv,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/Grupos.module.css";


const initialData = Array.from({ length: 100 }, (_, i) => ({
  nombre: ["BASE DE DATOS, DESARROLLO Y ANALISIS DE DATOS", "REDES Y COMUNICACIONES", "SOPORTE CLINICO SISTEMAS"][i % 3],
  entidad: ["Departamento de TI", "Recursos Humanos", "Contabilidad", "Operaciones"][i % 4],
  comentario: "",
}));

const Grupos = () => {

  // 1. Obtener datos del localStorage
  const userRole = localStorage.getItem("rol") || "usuario";
  const nombre = localStorage.getItem("nombre") || "";
  const isAdminOrTech = ["administrador", "tecnico", "usuario"].includes(userRole);

  // 2. Estados del componente
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Estados específicos para grupos
  const [grupos, setGrupos] = useState([]);
  const [filteredGrupos, setFilteredGrupos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newGrupo, setNewGrupo] = useState({
    nombre: '',
    entidad: '',
    comentarios: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filters, setFilters] = useState({
    id: "",
    titulo: "",
    solicitante: "",
    prioridad: "",
    estado: "",
    tecnico: "",
    grupo: "",
    categoria: "",
    nombre: '',
    entidad: '',
    comentarios: ''
  });


  const navigate = useNavigate();
  const location = useLocation();

  // 3. Render condicional temprano
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

  // Handlers genéricos
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleExportDropdown = () => setIsExportDropdownOpen(!isExportDropdownOpen);

  const toggleSupport = (e) => {
    e?.stopPropagation();
    setIsSupportOpen(!isSupportOpen);
    setIsAdminOpen(false);
    setIsConfigOpen(false);
  };

  const toggleAdmin = (e) => {
    e?.stopPropagation();
    setIsAdminOpen(!isAdminOpen);
    setIsSupportOpen(false);
    setIsConfigOpen(false);
  };

  const toggleConfig = (e) => {
    e?.stopPropagation();
    setIsConfigOpen(!isConfigOpen);
    setIsSupportOpen(false);
    setIsAdminOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/grupos?search=${encodeURIComponent(searchTerm)}`);
  };

  const roleToPath = {
    usuario: "/home",
    tecnico: "/HomeTecnicoPage",
    administrador: "/HomeAdmiPage",
  };

  // Handlers específicos para grupos
  const fetchGrupos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/grupos');
      setGrupos(response.data);
      setFilteredGrupos(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los grupos');
      setLoading(false);
      console.error(err);
    }
  };

useEffect(() => {
  fetchGrupos();
  // Cargar datos adicionales
  const loadAdditionalData = async () => {
    try {
      const [usersRes, techsRes, catsRes] = await Promise.all([
        axios.get('/api/usuarios'),
        axios.get('/api/tecnicos'), 
        axios.get('/api/categorias')
      ]);
      setUsuarios(usersRes.data);
      setTecnicos(techsRes.data);
      setCategorias(catsRes.data);
    } catch (err) {
      console.error("Error cargando datos adicionales", err);
    }
  };
  loadAdditionalData();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/grupos', newGrupo);
      setGrupos([...grupos, response.data]);
      setFilteredGrupos([...grupos, response.data]);
      setNewGrupo({ nombre: '', entidad: '', comentarios: '' });
      setShowForm(false);
      setLoading(false);
    } catch (err) {
      setError('Error al crear el grupo');
      setLoading(false);
      console.error(err);
    }
  };

  const handleSearch = (term) => {
    const filtered = grupos.filter(grupo =>
      grupo.nombre.toLowerCase().includes(term.toLowerCase()) ||
      grupo.entidad.toLowerCase().includes(term.toLowerCase()) ||
      (grupo.comentarios && grupo.comentarios.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredGrupos(filtered);
    setCurrentPage(1);
  };

  // Lógica de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredGrupos.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredGrupos.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      handleSearch(urlSearchTerm);
    }
  }, [location.search])

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filteredData = tickets.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        const itemValue = String(item[key] || "").toLowerCase();
        return itemValue.includes(filters[key].toLowerCase());
      });
    });
    setFilteredTickets(filteredData);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      id: "",
      titulo: "",
      solicitante: "",
      prioridad: "",
      estado: "",
      tecnico: "",
      grupo: "",
      categoria: "",
    });
    setFilteredTickets(tickets);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    console.log("Exportando a Excel", filteredTickets);
    setIsExportDropdownOpen(false);
  };

  const exportToPdf = () => {
    console.log("Exportando a PDF", filteredTickets);
    setIsExportDropdownOpen(false);
  };

  const exportToCsv = () => {
    console.log("Exportando a CSV", filteredTickets);
    setIsExportDropdownOpen(false);
  };

  const printTable = () => {
    window.print();
    setIsExportDropdownOpen(false);
  };


  const getRouteByRole = (section) => {
    if (section === "inicio") {
      if (userRole === "administrador") return "/HomeAdmiPage";
      if (userRole === "tecnico") return "/HomeTecnicoPage";
      return "/home";
    }
    if (section === "crear-caso") {
      if (["administrador", "tecnico"].includes(userRole)) return "/CrearCasoAdmin";
      return "/CrearCasoUse";
    }
    if (section === "tickets") return "/Tickets";
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
                  <Link to="/Problemas" className={styles.submenuLink}>
                    <FcExpired className={styles.menuIcon} />
                    <span className={styles.menuText}>Problemas</span>
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
      <div style={{
        marginLeft: isMenuExpanded ? "200px" : "60px",
        transition: "margin-left 0.3s ease",
      }}>
        <Outlet />
      </div>

      {/* Header */}
      <header
        className={styles.containerInicio}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.containerInicioImg}>
          <Link to={getRouteByRole("inicio")} className={styles.linkSinSubrayado}>
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
              onClick={handleSearchSubmit}
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

      {/* Contenido principal - Tabla de tickets */}
      <div
        className={styles.containerticket}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        {/* Barra de herramientas */}
        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <input
              className={styles.search}
              type="text"
              placeholder="Buscar en tickets..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            />
            <button
              type="button"
              className={styles.buttonBuscar}
              title="Buscar"
              onClick={() => handleSearch(searchTerm)}
            >
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.Buttonfiltros}
              title="Alternar filtros"
            >
              <FcEmptyFilter />
              <span className={styles.mostrasfiltros}>
                {showFilters ? "Ocultar" : "Mostrar"} filtros
              </span>
            </button>

            {/* Dropdown de exportación */}
            <div className={styles.exportDropdown}>
              <button
                onClick={toggleExportDropdown}
                className={styles.exportButton}
                title="Opciones de exportación"
              >
                Exportar <FaChevronDown className={styles.dropdownIcon} />
              </button>
              {isExportDropdownOpen && (
                <div
                  className={styles.exportDropdownContent}
                  onMouseLeave={() => setIsExportDropdownOpen(false)}
                >
                  <button onClick={exportToExcel} className={styles.exportOption}>
                    <FaFileExcel /> Excel
                  </button>
                  <button onClick={exportToPdf} className={styles.exportOption}>
                    <FaFilePdf /> PDF
                  </button>
                  <button onClick={exportToCsv} className={styles.exportOption}>
                    <FaFileCsv /> CSV
                  </button>
                  <button onClick={printTable} className={styles.exportOption}>
                    <FcPrint /> Imprimir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>ID</label>
                <input
                  type="text"
                  name="id"
                  value={filters.id}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.filterGroup}>
                <label>Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={filters.titulo}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.filterGroup}>
                <label>Solicitante</label>
                <select
                  name="solicitante"
                  value={filters.solicitante}
                  onChange={handleFilterChange}
                >
                  <option value="">Seleccione un usuario...</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                      {`${usuario.nombre_completo || ''}`} ({usuario.correo || ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Prioridad:</label>
                <select
                  name="prioridad"
                  value={filters.prioridad}
                  onChange={handleFilterChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="alta">Alta</option>
                  <option value="mediana">Mediana</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Estado:</label>
                <select
                  name="estado"
                  value={filters.estado}
                  onChange={handleFilterChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="en curso">En curso</option>
                  <option value="en espera">En espera</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Asignado a:</label>
                <select
                  name="tecnico"
                  value={filters.tecnico}
                  onChange={handleFilterChange}
                >
                  <option value="">Seleccionar técnico</option>
                  {tecnicos.map(tec => (
                    <option key={tec.id_usuario} value={tec.id_usuario}>
                      {tec.nombre_completo || ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Grupo asignado:</label>
                <select
                  name="grupo"
                  value={filters.grupo}
                  onChange={handleFilterChange}
                >
                  <option value="">Seleccionar grupo</option>
                  {grupos.map(grupo => (
                    <option key={grupo.id_grupo} value={grupo.id_grupo}>
                      {grupo.nombre || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Categoría:</label>
                <select
                  name="categoria"
                  value={filters.categoria}
                  onChange={handleFilterChange}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterActions}>
                <button onClick={applyFilters} className={styles.applyButton}>
                  Aplicar Filtros
                </button>
                <button onClick={clearFilters} className={styles.clearButton}>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal - Tabla de grupos */}
        <div
          className={styles.containerticket}
          style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
        >
          {/* Barra de herramientas */}
          <div className={styles.toolbar}>
            <div className={styles.searchContainer}>
              <input
                className={styles.search}
                type="text"
                placeholder="Buscar en grupos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
              <button
                type="button"
                className={styles.buttonBuscar}
                title="Buscar"
              >
                <FaMagnifyingGlass className={styles.searchIcon} />
              </button>
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => setShowForm(!showForm)}
                className={styles.buttonPrimary}
                disabled={loading}
              >
                {showForm ? (
                  <>
                    <FaTimes /> Cancelar
                  </>
                ) : (
                  <>
                    <FaPlus /> Nuevo Grupo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Formulario para crear nuevo grupo */}
          {showForm && (
            <div className={styles.formContainer}>
              <h3>Crear Nuevo Grupo</h3>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={newGrupo.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Entidad:</label>
                  <input
                    type="text"
                    name="entidad"
                    value={newGrupo.entidad}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Comentarios:</label>
                  <textarea
                    name="comentarios"
                    value={newGrupo.comentarios}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.buttonPrimary}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Grupo'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabla de grupos */}
    <div className={styles.tableContainer}>
        {loading && !showForm ? (
          <div className={styles.loadingMessage}>Cargando grupos...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          
            <table className={styles.tableticket}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Entidad</th>
                      <th>Comentarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length > 0 ? (
                      currentRows.map((grupo) => (
                        <tr key={grupo.id_grupo || grupo.nombre}>
                          <td>{grupo.nombre}</td>
                          <td>{grupo.entidad}</td>
                          <td>{grupo.comentarios || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className={styles.noData}>
                          No se encontraron grupos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>


        {/* Controles de paginación */}
        <div className={styles.paginationControls}>
          <div className={styles.rowsPerPageSelector}>
            <span>Filas por página:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className={styles.rowsSelect}
            >
              {[15, 30, 50, 100].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className={styles.rowsInfo}>
              Mostrando {indexOfFirstRow + 1}-
              {Math.min(indexOfLastRow, filteredTickets.length)} de{" "}
              {filteredTickets.length} tickets
            </span>
          </div>

          <div className={styles.pagination}>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <FaChevronLeft />
            </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`${styles.paginationButton} ${currentPage === pageNumber ? styles.active : ""}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className={styles.paginationEllipsis}>...</span>
                    )}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`${styles.paginationButton} ${currentPage === totalPages ? styles.active : ""}`}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={styles.paginationButton}
                    >
                      <FaChevronRight />
                    </button>
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
    </div>
  );
};

export default Grupos;