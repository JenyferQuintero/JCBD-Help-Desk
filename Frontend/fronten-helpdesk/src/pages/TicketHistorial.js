import React, { useState, useEffect } from "react";
import { Outlet, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaPowerOff, FaFilter, FaCalendarAlt, FaSearch, FaFileExport } from "react-icons/fa";
import { FiAlignJustify } from "react-icons/fi";
import { FcHome, FcAssistant, FcBusinessman, FcAutomatic, FcAnswers, FcCustomerSupport, FcExpired, FcGenealogy, FcBullish, FcConferenceCall, FcPortraitMode, FcOrganization } from "react-icons/fc";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegClock, FaCheckCircle } from 'react-icons/fa';
import styles from "../styles/SolucionTickets.module.css";
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TicketHistorial = () => {
    // Estados del componente
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [solucion, setSolucion] = useState('');
    const [accion, setAccion] = useState('seguimiento');
    const [surveyEnabled, setSurveyEnabled] = useState(false);
    const [surveyRating, setSurveyRating] = useState(0);
    const [surveyComment, setSurveyComment] = useState('');
    const [casos, setCasos] = useState([]);
    const [ticket, setTicket] = useState(null);
    const [seguimientos, setSeguimientos] = useState([]);
    const [nuevoSeguimiento, setNuevoSeguimiento] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState({
        ticket: null,
        historial: [],
        fullHistorial: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        fechaInicio: '',
        fechaFin: '',
        tipoCambio: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/tickets/${id}/historial`);

                if (!response.data.ticket || !Array.isArray(response.data.historial)) {
                    throw new Error('Estructura de datos incorrecta del servidor');
                }

                setData({
                    ticket: response.data.ticket,
                    historial: response.data.historial,
                    fullHistorial: response.data.historial
                });
                setLoading(false);
            } catch (err) {
                console.error('Error al obtener el historial:', err);
                setError(err.response?.data?.error || 'Error al cargar el historial');
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [id]);

    const applyFilters = () => {
        let filtered = [...data.fullHistorial];

        // Aplicar filtro de búsqueda
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(item =>
                (item.usuario && item.usuario.toLowerCase().includes(searchTerm)) ||
                (item.comentario && item.comentario.toLowerCase().includes(searchTerm)) ||
                Object.entries(item.cambios).some(([campo, valores]) =>
                    campo.toLowerCase().includes(searchTerm) ||
                    String(valores.anterior).toLowerCase().includes(searchTerm) ||
                    String(valores.nuevo).toLowerCase().includes(searchTerm)
                )
            );
        }

        // Aplicar filtro de fechas
        if (filters.fechaInicio) {
            const startDate = new Date(filters.fechaInicio);
            filtered = filtered.filter(item =>
                new Date(item.fecha_cambio) >= startDate
            );
        }

        if (filters.fechaFin) {
            const endDate = new Date(filters.fechaFin);
            filtered = filtered.filter(item =>
                new Date(item.fecha_cambio) <= endDate
            );
        }

        // Aplicar filtro por tipo de cambio
        if (filters.tipoCambio) {
            filtered = filtered.filter(item =>
                Object.keys(item.cambios).includes(filters.tipoCambio)
            );
        }

        setData(prev => ({ ...prev, historial: filtered }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            fechaInicio: '',
            fechaFin: '',
            tipoCambio: ''
        });
        setData(prev => ({ ...prev, historial: prev.fullHistorial }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const exportToPDF = () => {
        if (!data.ticket || !data.historial.length) return;
        
        const doc = new jsPDF();
        const title = `Historial del Ticket #${data.ticket.id}`;
        const headers = [['Fecha', 'Usuario', 'Campo', 'Valor Anterior', 'Valor Nuevo', 'Comentario']];

        const rows = data.historial.flatMap(item =>
            Object.entries(item.cambios).map(([campo, valores]) => [
                new Date(item.fecha_cambio).toLocaleString(),
                item.usuario || 'Sistema',
                campo,
                String(valores.anterior || 'N/A'),
                String(valores.nuevo || 'N/A'),
                item.comentario || ''
            ])
        );

        doc.text(title, 14, 15);
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 20,
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 50 }
            }
        });

        doc.save(`historial_ticket_${data.ticket.id}.pdf`);
    };

    const getExportData = () => {
        if (!data.historial.length) return [];
        
        return data.historial.flatMap(item =>
            Object.entries(item.cambios).map(([campo, valores]) => ({
                'Fecha': new Date(item.fecha_cambio).toLocaleString(),
                'Usuario': item.usuario || 'Sistema',
                'Campo': campo,
                'Valor Anterior': String(valores.anterior || 'N/A'),
                'Valor Nuevo': String(valores.nuevo || 'N/A'),
                'Comentario': item.comentario || ''
            }))
        );
    };

    const getFieldTypes = () => {
        if (!data.fullHistorial.length) return [];
        
        const fields = new Set();
        data.fullHistorial.forEach(item => {
            Object.keys(item.cambios).forEach(field => fields.add(field));
        });
        return Array.from(fields);
    };

    // Paginación
    const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
    const currentItems = data.historial.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.historial.length / pagination.itemsPerPage);

    const handleAgregarSeguimiento = async () => {
        if (!nuevoSeguimiento.trim()) return;

        try {
            await axios.post(`http://localhost:5000/api/tickets/${id}/seguimientos`, {
                descripcion: nuevoSeguimiento,
                usuario: localStorage.getItem("nombre")
            });

            const response = await axios.get(`http://localhost:5000/api/tickets/${id}/seguimientos`);
            setSeguimientos(response.data);
            setNuevoSeguimiento("");
        } catch (error) {
            console.error("Error al agregar seguimiento:", error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            setIsLoadingSearch(true);
            setError(null);
            // Aquí va lógica de búsqueda con axios
            navigate(`/Tickets?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm("");
        } catch (error) {
            setError("Error al realizar la búsqueda");
            console.error("Error en búsqueda:", error);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    // Handlers del menú
    const nombre = localStorage.getItem("nombre");
    const userRole = localStorage.getItem("rol");
    const isAdminOrTech = ['admin', 'tecnico'].includes(userRole);

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
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando historial del ticket...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    Volver atrás
                </button>
            </div>
        );
    }

    if (!data.ticket) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>No se pudo cargar la información del ticket</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    Volver atrás
                </button>
            </div>
        );
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
            <span className={styles.username}>Bienvenido, <span id="nombreusuario">{nombre}</span></span>
            <div className={styles.iconContainer}>
              <Link to="/">
                <FaPowerOff className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
      </header>

            <div className={styles.container} style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}>
                <div className={styles.header}>
                    <div className={styles.headerTop}>
                        <h1>Historial del Ticket #{data.ticket.id}</h1>
                        <div className={styles.exportButtons}>
                            <CSVLink
                                data={getExportData()}
                                filename={`historial_ticket_${data.ticket.id}.csv`}
                                className={styles.exportButton}
                            >
                                <FaFileExport /> Exportar a CSV
                            </CSVLink>
                            <button
                                onClick={exportToPDF}
                                className={styles.exportButton}
                            >
                                <FaFileExport /> Exportar a PDF
                            </button>
                        </div>
                    </div>

                    <div className={styles.ticketInfo}>
                        <h2>{data.ticket.titulo}</h2>
                        <div className={styles.metaInfo}>
                            <span><strong>Estado:</strong> {data.ticket.estado}</span>
                            <span><strong>Fecha creación:</strong> {new Date(data.ticket.fecha_creacion).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className={styles.filterBar}>
                        <div className={styles.searchBox}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Buscar en historial..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={styles.filterToggle}
                        >
                            <FaFilter /> {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                        </button>

                        <button
                            onClick={applyFilters}
                            className={styles.applyButton}
                        >
                            Aplicar filtros
                        </button>

                        <button
                            onClick={resetFilters}
                            className={styles.resetButton}
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    {showFilters && (
                        <div className={styles.advancedFilters}>
                            <div className={styles.filterGroup}>
                                <label>
                                    <FaCalendarAlt /> Fecha desde:
                                    <input
                                        type="date"
                                        value={filters.fechaInicio}
                                        onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>
                                    <FaCalendarAlt /> Fecha hasta:
                                    <input
                                        type="date"
                                        value={filters.fechaFin}
                                        onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>
                                    Tipo de cambio:
                                    <select
                                        value={filters.tipoCambio}
                                        onChange={(e) => setFilters({ ...filters, tipoCambio: e.target.value })}
                                    >
                                        <option value="">Todos</option>
                                        {getFieldTypes().map((field, index) => (
                                            <option key={index} value={field}>{field}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.historyContainer}>
                    {data.historial.length === 0 ? (
                        <div className={styles.emptyMessage}>
                            No se encontraron registros históricos para este ticket
                        </div>
                    ) : (
                        <>
                            <div className={styles.timeline}>
                                {currentItems.map((item, index) => (
                                    <div key={index} className={styles.timelineItem}>
                                        <div className={styles.timelineHeader}>
                                            <div className={styles.timelineDot}></div>
                                            <div className={styles.timelineDate}>
                                                {new Date(item.fecha_cambio).toLocaleString()}
                                            </div>
                                            <div className={styles.timelineUser}>
                                                {item.usuario || 'Sistema'}
                                            </div>
                                        </div>

                                        <div className={styles.timelineContent}>
                                            {item.cambios && Object.entries(item.cambios).map(([campo, valores]) => (
                                                <div key={campo} className={styles.changeItem}>
                                                    <span className={styles.changeField}>{campo}:</span>
                                                    <span className={styles.oldValue}>{valores.anterior || 'N/A'}</span>
                                                    <span className={styles.arrow}>→</span>
                                                    <span className={styles.newValue}>{valores.nuevo || 'N/A'}</span>
                                                </div>
                                            ))}

                                            {item.comentario && (
                                                <div className={styles.comment}>
                                                    <strong>Comentario:</strong> {item.comentario}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.paginationControls}>
                                <button
                                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                    disabled={pagination.currentPage === 1}
                                >
                                    Anterior
                                </button>

                                <span>
                                    Página {pagination.currentPage} de {totalPages}
                                </span>

                                <button
                                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                    disabled={pagination.currentPage === totalPages}
                                >
                                    Siguiente
                                </button>

                                <select
                                    value={pagination.itemsPerPage}
                                    onChange={(e) => setPagination({
                                        ...pagination,
                                        itemsPerPage: Number(e.target.value),
                                        currentPage: 1
                                    })}
                                >
                                    <option value="5">5 por página</option>
                                    <option value="10">10 por página</option>
                                    <option value="20">20 por página</option>
                                    <option value="50">50 por página</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button onClick={() => navigate(-1)} className={styles.backButton}>
                        Volver al ticket
                    </button>
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

export default TicketHistorial;