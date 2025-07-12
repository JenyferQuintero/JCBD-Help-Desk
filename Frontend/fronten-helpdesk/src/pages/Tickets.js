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
  FaCheckCircle
} from "react-icons/fa";
import axios from "axios";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";
import styles from "../styles/Tickets.module.css";

const Tickets = () => {
  // 1. Todos los hooks y estados primero
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 2. Obtener datos del usuario
  const userRole = localStorage.getItem("rol") || "usuario";
  const userId = localStorage.getItem("id_usuario") || "";
  const nombre = localStorage.getItem("nombre") || "";

  // 3. Efectos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/usuarios/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            usuario_id: userId,
            rol: userRole
          }
        });

        const normalizedTickets = response.data.map(ticket => ({
          id: ticket.id_ticket || ticket.id || '',
          id_ticket: ticket.id_ticket || ticket.id || '',
          titulo: ticket.titulo || '',
          solicitante: ticket.solicitante || '',
          solicitanteId: ticket.solicitanteId || '',
          descripcion: ticket.descripcion || '',
          prioridad: ticket.prioridad || '',
          estado: ticket.estado || ticket.estado_ticket || '',
          tecnico: ticket.tecnico || ticket.nombre_tecnico || '',
          grupo: ticket.grupo || '',
          categoria: ticket.categoria || ticket.nombre_categoria || '',
          fecha_creacion: ticket.fecha_creacion || ticket.fechaApertura || '',
          ultimaActualizacion: ticket.ultimaActualizacion || '',
          solucion: ticket.solucion || ''
        }));

        setTickets(normalizedTickets);
        setFilteredTickets(normalizedTickets);
      } catch (err) {
        setError("Error al cargar datos");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId, userRole]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      handleSearch(urlSearchTerm);
    }
  }, [location.search]);

  // 4. Handlers
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

  const handleSearch = (searchValue) => {
    const term = searchValue.toLowerCase().trim();
    if (!term) {
      setFilteredTickets(tickets);
      return;
    }
    const filtered = tickets.filter((item) =>
      Object.values(item).some((val) =>
        val ? String(val).toLowerCase().includes(term) : false
      )
    );
    setFilteredTickets(filtered);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/Tickets?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/Tickets/${ticketId}`);
  };

  const handleViewSolution = (ticketId) => {
    if (['administrador', 'tecnico'].includes(userRole)) {
      navigate(`/SolucionarTicket/${ticketId}`); // Ruta para solucionar ticket
    } else {
      navigate(`/SolucionTicket/${ticketId}`); // Ruta para ver solución
    }
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
            <span className={styles.username}> Bienvenido, <span id="nombreusuario">{nombre}</span>
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
                <th>Fecha Apertura</th>
                <th>Última Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((ticket, index) => (
                  <tr 
                    key={index}
                    className={ticket.solicitanteId === parseInt(userId) ? styles.userTicket : ""}
                  >
                    <td>
                      <span
                        className={styles.clickableCell}
                        onClick={() => handleTicketClick(ticket.id || ticket.id_ticket)}
                      >
                        {ticket.id || ticket.id_ticket || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.clickableCell}
                        onClick={() => handleTicketClick(ticket.id || ticket.id_ticket)}
                      >
                        {String(ticket.titulo || 'Sin título').toUpperCase()}
                      </span>
                    </td>
                    <td>{String(ticket.solicitante || 'Sin solicitante').toUpperCase()}</td>
                    <td>{String(ticket.descripcion || 'Sin descripción').toUpperCase()}</td>
                    <td>
                      <span
                        className={`${styles.priority} ${styles[String(ticket.prioridad || '').toLowerCase()] || ''}`}
                      >
                        {String(ticket.prioridad || 'Sin prioridad').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${styles[String(ticket.estado || '').toLowerCase()] || ''}`}
                      >
                        {String(ticket.estado || 'Sin estado').toUpperCase()}
                      </span>
                    </td>
                    <td>{String(ticket.tecnico || 'No asignado').toUpperCase()}</td>
                    <td>{String(ticket.grupo || 'Sin grupo').toUpperCase()}</td>
                    <td>{String(ticket.categoria || 'Sin categoría').toUpperCase()}</td>
                    <td>
                      {ticket.fecha_creacion || ticket.fechaApertura ? (
                        new Date(`${ticket.fecha_creacion || ticket.fechaApertura} -05:00`)
                          .toLocaleString("es-CO", {
                            timeZone: "America/Bogota",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .toUpperCase()
                      ) : 'Sin fecha'}
                    </td>
                    <td>
                      {ticket.ultimaActualizacion ? (
                        new Date(`${ticket.ultimaActualizacion} -05:00`)
                          .toLocaleString("es-CO", {
                            timeZone: "America/Bogota",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .toUpperCase()
                      ) : 'Sin actualización'}
                    </td>
                    <td className={styles.actionsCell}>
                      {/* Botón de Solución - visible para usuarios (solicitantes) y admin/tecnico */}
                      {(ticket.solicitanteId === parseInt(userId) || ['administrador', 'tecnico'].includes(userRole)) && (
                        <button
                          onClick={() => handleViewSolution(ticket.id || ticket.id_ticket)}
                          className={styles.solutionButton}
                          title={['administrador', 'tecnico'].includes(userRole) ? "Solucionar ticket" : "Ver solución"}
                        >
                          <FaCheckCircle /> 
                          {['administrador', 'tecnico'].includes(userRole) ? " Solucionar" : " Solución"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className={styles.noResults}>
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

export default Tickets;
