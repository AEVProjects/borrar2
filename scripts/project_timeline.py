"""
MSI Social Media Manager - Línea de Tiempo del Proyecto
Basado en historial de Git
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from datetime import datetime, timedelta
import matplotlib.dates as mdates
import numpy as np

# Configurar fuente
plt.rcParams['font.family'] = 'Segoe UI'
plt.rcParams['font.size'] = 10

# Tareas organizadas jerárquicamente (de abajo hacia arriba en el gráfico)
tareas = [
    # FASE 4 - Análisis y Engagement (comienza 11 febrero) - Por definir
    ("Por definir subtareas...", "2026-02-11", "2026-02-28", "#BDBDBD", 2),
    
    # FASE 4 - Principal
    ("ANÁLISIS Y ENGAGEMENT DE LEADS", "2026-02-11", "2026-02-28", "#5E35B1", 0),
    
    # Separador visual
    ("", "", "", "", -1),
    
    # FASE 3 - Web Scraping (comienza 17 enero)
    # Semana 4: Testing Final (7 feb - 10 feb)
    ("Testing y QA Final", "2026-02-07", "2026-02-10", "#26A69A", 2),
    
    # Semana 3: Integración (31 ene - 6 feb)
    ("Dashboard Leads y Candidatos", "2026-02-03", "2026-02-06", "#26A69A", 2),
    ("UI Visualización Data Scrapeada", "2026-01-31", "2026-02-02", "#26A69A", 2),
    
    # Semana 2: Scraping (24 ene - 30 ene)
    ("Filtros y Scoring de Perfiles", "2026-01-28", "2026-01-30", "#4DD0E1", 2),
    ("Scraping Leads de LinkedIn", "2026-01-24", "2026-01-27", "#4DD0E1", 2),
    
    # Semana 1: Auto-Posts (17 ene - 23 ene)
    ("Generación Automática Posts con Data", "2026-01-21", "2026-02-10", "#9575CD", 2),
    ("Envío Automático a Marketing", "2026-01-20", "2026-01-21", "#7E57C2", 2),
    ("Posts desde Data Scrapeada", "2026-01-18", "2026-01-20", "#7E57C2", 2),
    ("Diseño Workflow Input-Based", "2026-01-17", "2026-01-18", "#7E57C2", 2),
    
    # FASE 3 - Principal
    ("WEB SCRAPING Y AUTOMATIZACIÓN", "2026-01-17", "2026-02-10", "#00695C", 0),
    
    # Separador visual
    ("", "", "", "", -1),
    
    # FASE 2 - Subtareas
    # Generación de Videos con Veo 3 (9-16 ene)
    ("Publicación y Testing Videos", "2026-01-15", "2026-01-16", "#FF7043", 2),
    ("Prompts y Generación con Veo 3", "2026-01-12", "2026-01-14", "#FF7043", 2),
    ("Diseño Workflow de Videos", "2026-01-09", "2026-01-11", "#FF7043", 2),
    
    # Features Finales (6-8 ene)
    ("Autenticación con Contraseña", "2026-01-07", "2026-01-08", "#78909C", 2),
    ("Paleta de Colores Personalizable", "2026-01-06", "2026-01-08", "#78909C", 2),
    ("Coherencia Imagen de Marca", "2026-01-06", "2026-01-08", "#78909C", 2),
    
    # Refinamiento de Prompts (30 dic - 7 ene)
    ("Gradientes H/V y Routing Modular", "2026-01-05", "2026-01-07", "#EF5350", 2),
    ("Fotografía Realista (Anti-IA)", "2026-01-03", "2026-01-07", "#EF5350", 2),
    ("Logo y Branding MSI Technologies", "2026-01-02", "2026-01-03", "#EF5350", 2),
    ("Estilos Visuales (Glassmorphism...)", "2025-12-30", "2026-01-02", "#EF5350", 2),
    
    # Features UX (24-30 dic)
    ("Edición de Imágenes", "2025-12-28", "2025-12-30", "#AB47BC", 2),
    ("Seguimiento en Tiempo Real", "2025-12-26", "2025-12-28", "#AB47BC", 2),
    ("Alertas de Progreso y Modales", "2025-12-24", "2025-12-26", "#AB47BC", 2),
    
    # Desarrollo Frontend (19-24 dic)
    ("Formularios Generar/Editar", "2025-12-22", "2025-12-24", "#FF9800", 2),
    ("Grid de Posts y Badges", "2025-12-21", "2025-12-22", "#FF9800", 2),
    ("Interfaz Base y Navegación", "2025-12-19", "2025-12-21", "#FF9800", 2),
    
    # FASE 2 - Principal
    ("PLATAFORMA WEB Y PROMPTS", "2025-12-19", "2026-01-16", "#E65100", 0),
    
    # Separador visual
    ("", "", "", "", -1),
    
    # FASE 1 - Subtareas
    ("Prompts Iniciales y Testing", "2025-12-17", "2025-12-19", "#81C784", 2),
    ("Generación de Imágenes (Gemini)", "2025-12-15", "2025-12-17", "#81C784", 2),
    ("Agentes IA (Strategy, Copy, Image)", "2025-12-12", "2025-12-15", "#81C784", 2),
    ("Base de Datos y UPSERT", "2025-12-16", "2025-12-19", "#64B5F6", 2),
    ("LinkedIn/Instagram/Facebook", "2025-12-12", "2025-12-16", "#64B5F6", 2),
    ("Integración ImgBB Multi-imagen", "2025-12-08", "2025-12-12", "#64B5F6", 2),
    ("Configuración Inicial y Webhooks", "2025-12-02", "2025-12-08", "#64B5F6", 2),
    
    # FASE 1 - Principal
    ("DISEÑO WORKFLOWS N8N", "2025-12-02", "2025-12-19", "#1565C0", 0),
]

# Crear figura
fig, ax = plt.subplots(figsize=(16, 11))
fig.patch.set_facecolor('#FAFAFA')
ax.set_facecolor('#FAFAFA')

# Posiciones Y
y_pos = 0
y_positions = []
bar_data = []

for nombre, inicio, fin, color, nivel in tareas:
    if nivel == -1:  # Separador
        y_pos += 0.5
        continue
    
    y_positions.append(y_pos)
    bar_data.append((nombre, inicio, fin, color, nivel, y_pos))
    y_pos += 1

# Dibujar barras con nombres
for nombre, inicio, fin, color, nivel, y in bar_data:
    if not inicio:
        continue
        
    start_date = datetime.strptime(inicio, "%Y-%m-%d")
    end_date = datetime.strptime(fin, "%Y-%m-%d")
    
    # Mínimo 1 día de ancho
    if start_date == end_date:
        end_date = start_date + timedelta(days=0.8)
    
    # Altura según nivel
    height = 0.5 if nivel == 0 else 0.4
    alpha = 1.0 if nivel == 0 else 0.9
    
    # Barra
    bar_width = (end_date - start_date).days + 1  # +1 para cubrir el día completo
    ax.barh(y, bar_width,
            left=mdates.date2num(start_date),
            height=height,
            color=color,
            alpha=alpha,
            edgecolor='white',
            linewidth=1.5 if nivel == 0 else 0.5,
            zorder=3 if nivel == 0 else 2)
    
    # Texto debajo de la barra
    bar_start = mdates.date2num(start_date)
    fontsize = 8 if nivel == 0 else 7
    fontweight = 'bold' if nivel == 0 else 'normal'
    
    ax.text(bar_start + 0.3, y - 0.35, nombre, 
            ha='left', va='top',
            fontsize=fontsize, fontweight=fontweight, color='#333',
            zorder=5)

# Configurar eje X
ax.xaxis.set_major_formatter(mdates.DateFormatter('%d %b'))
ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=0))  # Cada lunes
ax.xaxis.set_minor_locator(mdates.DayLocator(interval=1))
plt.xticks(rotation=45, ha='right', fontsize=10)

# Límites
ax.set_xlim(datetime(2025, 12, 1), datetime(2026, 3, 3))
ax.set_ylim(-0.8, max(y_positions) + 1.2)

# Ocultar eje Y
ax.set_yticks([])
ax.set_yticklabels([])

# Grid vertical
ax.grid(axis='x', alpha=0.3, linestyle='-', linewidth=0.5, zorder=1)
ax.grid(axis='x', which='minor', alpha=0.15, linestyle='-', linewidth=0.3, zorder=1)

# Línea divisoria entre fases (horizontales)
separator_y1 = bar_data[23][5] + 0.8  # Después de la fase 2 principal
ax.axhline(y=separator_y1, color='#BDBDBD', linestyle='--', linewidth=1.5, alpha=0.7, zorder=1)

# Separador entre fase 2 y 3
separator_y2 = bar_data[10][5] + 0.8  # Después de la fase 3 principal
ax.axhline(y=separator_y2, color='#BDBDBD', linestyle='--', linewidth=1.5, alpha=0.7, zorder=1)

# Línea vertical en el cambio de fase (19 dic) - solo en la parte superior
ax.axvline(x=mdates.date2num(datetime(2025, 12, 19)), 
           color='#1565C0', linestyle=':', alpha=0.25, linewidth=1, zorder=0)

# Título
ax.set_title('MSI Automation\nPlataforma Integral de Marketing Digital con IA', 
             fontsize=18, fontweight='bold', pad=20, color='#333')
ax.set_xlabel('', fontsize=10, labelpad=10)

# Leyenda - Solo tareas y subtareas, abajo a la izquierda
legend_items = [
    mpatches.Patch(color='#64B5F6', label='Workflow Publicación'),
    mpatches.Patch(color='#81C784', label='Generación Contenido IA'),
    mpatches.Patch(color='#FF9800', label='Desarrollo Frontend'),
    mpatches.Patch(color='#AB47BC', label='Features UX'),
    mpatches.Patch(color='#EF5350', label='Refinamiento Prompts'),
    mpatches.Patch(color='#78909C', label='Features Finales'),
    mpatches.Patch(color='#FF7043', label='Generación de Videos'),
    mpatches.Patch(color='#7E57C2', label='Generación Auto-Posts'),
    mpatches.Patch(color='#9575CD', label='Posts Diarios'),
    mpatches.Patch(color='#4DD0E1', label='Scraping Perfiles'),
    mpatches.Patch(color='#26A69A', label='Integración Plataforma'),
]
legend = ax.legend(handles=legend_items, loc='lower left', 
                   framealpha=0.95, fontsize=8, fancybox=True,
                   title='Tareas', title_fontsize=9,
                   edgecolor='#DDD', ncol=2)
legend.get_title().set_fontweight('bold')

# Estilo de bordes
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_visible(False)
ax.spines['bottom'].set_color('#BDBDBD')

# Anotaciones de fase en la parte superior
ax.annotate('FASE 1: Workflows n8n (Dic 2-19)', 
            xy=(mdates.date2num(datetime(2025, 12, 10)), max(y_positions) + 0.9),
            fontsize=9, fontweight='bold', color='#1565C0', ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#E3F2FD', edgecolor='#1565C0', alpha=0.9))
ax.annotate('FASE 2: Plataforma (Dic 19 - Ene 16)', 
            xy=(mdates.date2num(datetime(2025, 12, 28)), max(y_positions) + 0.9),
            fontsize=9, fontweight='bold', color='#E65100', ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#FFF3E0', edgecolor='#E65100', alpha=0.9))
ax.annotate('FASE 3: Scraping y Automatización (Ene 17 - Feb 10)', 
            xy=(mdates.date2num(datetime(2026, 1, 28)), max(y_positions) + 0.9),
            fontsize=9, fontweight='bold', color='#00695C', ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#E0F2F1', edgecolor='#00695C', alpha=0.9))
ax.annotate('FASE 4: Engagement (Feb 11+)', 
            xy=(mdates.date2num(datetime(2026, 2, 20)), max(y_positions) + 0.9),
            fontsize=9, fontweight='bold', color='#5E35B1', ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#EDE7F6', edgecolor='#5E35B1', alpha=0.9))

# Línea vertical HOY (8 enero) - más sutil
ax.axvline(x=mdates.date2num(datetime(2026, 1, 8)), 
           color='#D32F2F', linestyle='-', alpha=0.6, linewidth=1.5, zorder=0)
ax.annotate('HOY', xy=(mdates.date2num(datetime(2026, 1, 8)), max(y_positions) + 0.4),
            fontsize=8, fontweight='bold', color='#D32F2F', ha='center',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#FFEBEE', edgecolor='#D32F2F', alpha=0.9))

plt.tight_layout()
plt.savefig('project_timeline.png', dpi=150, bbox_inches='tight', 
            facecolor='#FAFAFA', edgecolor='none')
plt.show()

print("✅ Timeline guardado como 'project_timeline.png'")
