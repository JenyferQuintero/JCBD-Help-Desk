import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import { FcEmptyFilter, FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization, FcPrint } from "react-icons/fc";
import { FaFileExcel, FaFilePdf, FaFileCsv, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from "axios";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/Tickets.module.css";

// Datos de ejemplo
const initialData = Array.from({ length: 100 }, (_, i) => ({
  id: `2503290${(1000 - i).toString().padStart(3, '0')}`,
  titulo: `CREACION DE USUARIOS - PARALELO ACADEMICO ${i + 1}`,
  solicitante: 'Jenyfer Quintero Calixto',
  descripcion: 'ALIMENTAR EL EXCEL DE DELOGIN',
  prioridad: ['Mediana', 'Alta', 'Baja'][i % 3],
  estado: ['Cerrado', 'Abierto', 'En Curso'][i % 3],
  tecnico: 'Jenyfer Quintero Calixto',
  grupo: 'EDQ B',
  categoria: 'CREACION DE USUARIO',
  ultimaActualizacion: '2025-03-29 03:40',
  fechaApertura: '2025-03-29 03:19'
}));

const Tickets = () => {
  // Estados
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tickets, setTickets] = useState(initialData);
  const [filteredTickets, setFilteredTickets] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingDemoData, setUsingDemoData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    id: '', titulo: '', solicitante: '', prioridad: '', estado: '',
    tecnico: '', grupo: '', categoria: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("rol") || "usuario";
  const nombre = localStorage.getItem("nombre");

  // Handlers
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleExportDropdown = () => setIsExportDropdownOpen(!isExportDropdownOpen);

  const toggleSupport = (e) => {
    e.stopPropagation();
    setIsSupportOpen(!isSupportOpen);
    setIsAdminOpen(false);
    setIsConfigOpen(false);
  };

  const toggleAdmin = (e) => {
    e.stopPropagation();
    setIsAdminOpen(!isAdminOpen);
    setIsSupportOpen(false);
    setIsConfigOpen(false);
  };

  const toggleConfig = (e) => {
    e.stopPropagation();
    setIsConfigOpen(!isConfigOpen);
    setIsSupportOpen(false);
    setIsAdminOpen(false);
  };

  const roleToPath = {
    usuario: '/home',
    tecnico: '/HomeTecnicoPage',
    administrador: '/HomeAdmiPage'
  };

  // Función para cargar tickets reales (opcional)
  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTickets(response.data);
      setFilteredTickets(response.data);
      setUsingDemoData(false);
    } catch (err) {
      setError("No se pudo conectar al servidor. Mostrando datos de ejemplo.");
      setTickets(initialData);
      setFilteredTickets(initialData);
      setUsingDemoData(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Comentado para usar solo datos de ejemplo
    // fetchTickets();
  }, []);

  // Manejar búsqueda desde URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      handleSearch(urlSearchTerm);
    }
  }, [location.search]);

  // Handlers para búsqueda
  const handleSearch = (searchValue) => {
    const term = searchValue.toLowerCase().trim();

    if (!term) {
      setFilteredTickets(tickets);
      return;
    }

    const filtered = tickets.filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });

    setFilteredTickets(filtered);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/tickets?search=${encodeURIComponent(searchTerm)}`);
  };

  // Handlers para filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filteredData = tickets.filter(item => {
      return Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        return String(item[key]).toLowerCase().includes(filters[key].toLowerCase());
      });
    });
    setFilteredTickets(filteredData);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      id: '',
      titulo: '',
      solicitante: '',
      prioridad: '',
      estado: '',
      tecnico: '',
      grupo: '',
      categoria: ''
    });
    setFilteredTickets(tickets);
    setCurrentPage(1);
  };

  // Handlers para exportación
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

  // Lógica de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTickets.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Función para manejar el clic en un ticket
  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/solucion/${ticketId}`);
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
    } else if (section === 'tickets') {
      return '/Tickets';
    } else {
      return '/home';
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
          <Link to={getRouteByRole('inicio')} className={styles.linkSinSubrayado}>
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
            <span className={styles.username}>Bienvenido, <span id="nombreusuario">{nombre}</span></span>
            <div className={styles.iconContainer}>
              <Link to="/">
                <FaPowerOff className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal - Tabla de tickets */}
      <div className={styles.containerticket} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
        {/* Barra de herramientas */}
        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <input
              className={styles.search}
              type="text"
              placeholder="Buscar en tickets..."
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
              onClick={() => handleSearch(searchTerm)}
            >
              <FaMagnifyingGlass className={styles.searchIcon} />
            </button>
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.actionButton}
              title="Alternar filtros"
            >
              <FcEmptyFilter />
              <span>{showFilters ? 'Ocultar' : 'Mostrar'} filtros</span>
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
                  <button
                    onClick={exportToExcel}
                    className={styles.exportOption}
                  >
                    <FaFileExcel /> Excel
                  </button>
                  <button
                    onClick={exportToPdf}
                    className={styles.exportOption}
                  >
                    <FaFilePdf /> PDF
                  </button>
                  <button
                    onClick={exportToCsv}
                    className={styles.exportOption}
                  >
                    <FaFileCsv /> CSV
                  </button>
                  <button
                    onClick={printTable}
                    className={styles.exportOption}
                  >
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
                  placeholder="Filtrar por ID"
                />
              </div>
              <div className={styles.filterGroup}>
                <label>Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={filters.titulo}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por título"
                />
              </div>
              <div className={styles.filterGroup}>
                <label>Solicitante</label>
                <input
                  type="text"
                  name="solicitante"
                  value={filters.solicitante}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por solicitante"
                />
              </div>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.actionButton}>
                <label>Prioridad</label>
                <select
                  name="prioridad"
                  value={filters.prioridad}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="Alta">Alta</option>
                  <option value="Mediana">Mediana</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              <div className={styles.actionButton}>
                <label>Estado</label>
                <select
                  name="estado"
                  value={filters.estado}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="Abierto">Abierto</option>
                  <option value="En Curso">En Curso</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Técnico</label>
                <input
                  type="text"
                  name="tecnico"
                  value={filters.tecnico}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por técnico"
                />
              </div>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Grupo</label>
                <input
                  type="text"
                  name="grupo"
                  value={filters.grupo}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por grupo"
                />
              </div>
              <div className={styles.filterGroup}>
                <label>Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  value={filters.categoria}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por categoría"
                />
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

        {/* Tabla de tickets */}
        <div className={styles.tableContainer}>
          <table className={styles.tableticket}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Solicitante</th>
                <th>Descripción</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Técnico</th>
                <th>Grupo</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((ticket, index) => (
                  <tr key={index}>
                    <td>
                      <span
                        className={styles.clickableCell}
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        {ticket.id}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.clickableCell}
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        {ticket.titulo}
                      </span>
                    </td>
                    <td>{ticket.solicitante}</td>
                    <td>{ticket.descripcion}</td>
                    <td>
                      <span className={`${styles.priority} ${styles[ticket.prioridad.toLowerCase()]}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[ticket.estado.toLowerCase().replace(' ', '')]}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td>{ticket.tecnico}</td>
                    <td>{ticket.grupo}</td>
                    <td>{ticket.categoria}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.noResults}>
                    No se encontraron tickets que coincidan con los criterios de búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación */}
        <div className={styles.paginationControls}>
          <div className={styles.rowsPerPageSelector}>
            <span>Filas por página:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className={styles.rowsSelect}
            >
              {[15, 30, 50, 100].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className={styles.rowsInfo}>
              Mostrando {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredTickets.length)} de {filteredTickets.length} tickets
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
                  className={`${styles.paginationButton} ${currentPage === pageNumber ? styles.active : ''}`}
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
                className={`${styles.paginationButton} ${currentPage === totalPages ? styles.active : ''}`}
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

export default Tickets;