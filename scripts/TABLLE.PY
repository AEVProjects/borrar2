import plotly.express as px
import pandas as pd

# Diccionario de datos con todas tus tareas organizadas por módulo.
# Nota: A las tareas de 1 solo día se les añadió +1 día en "Finish" para que la barra se visualice en el gráfico.
# Las tareas continuas ("->") o "Por definir" se proyectaron hasta el 28 de Feb.

datos_gantt = [
    # --- MÓDULO: VIDEO ---
    {"Task": "Generación de video con IA (Veo 3)", "Start": "2026-01-12", "Finish": "2026-01-15", "Module": "Video"},
    {"Task": "Videos verticales con branding MSI", "Start": "2026-01-16", "Finish": "2026-01-17", "Module": "Video"},
    {"Task": "Migración a Vertex AI (ref image)", "Start": "2026-01-20", "Finish": "2026-01-21", "Module": "Video"},
    {"Task": "Image-to-Video hiper-realista", "Start": "2026-01-22", "Finish": "2026-01-23", "Module": "Video"},
    {"Task": "Selector de servicios MSI", "Start": "2026-01-27", "Finish": "2026-01-28", "Module": "Video"},
    {"Task": "Video extension (desde último frame)", "Start": "2026-01-28", "Finish": "2026-02-11", "Module": "Video"},
    {"Task": "Video doble: 2 imágenes/personas", "Start": "2026-02-06", "Finish": "2026-02-07", "Module": "Video"},
    {"Task": "Reescritura del workflow de video", "Start": "2026-02-06", "Finish": "2026-02-07", "Module": "Video"},
    {"Task": "Almacenamiento en GCS y Signed URLs", "Start": "2026-02-03", "Finish": "2026-02-09", "Module": "Video"},
    {"Task": "Merge de videos: browser", "Start": "2026-02-09", "Finish": "2026-02-10", "Module": "Video"},
    {"Task": "Merge de videos: server-side", "Start": "2026-02-10", "Finish": "2026-02-11", "Module": "Video"},
    {"Task": "Fix: mute entre videos", "Start": "2026-02-10", "Finish": "2026-02-11", "Module": "Video"},
    {"Task": "Fix: corte del habla", "Start": "2026-02-10", "Finish": "2026-02-11", "Module": "Video"},
    {"Task": "Prompts profesionales de video", "Start": "2026-02-10", "Finish": "2026-02-11", "Module": "Video"},
    {"Task": "DB save robusto para video", "Start": "2026-02-10", "Finish": "2026-02-11", "Module": "Video"},
    {"Task": "Voice consistency v1 & v2", "Start": "2026-02-11", "Finish": "2026-02-12", "Module": "Video"},
    {"Task": "Prompts service-specific", "Start": "2026-02-11", "Finish": "2026-02-12", "Module": "Video"},
    {"Task": "Voice Video Extend workflow", "Start": "2026-02-11", "Finish": "2026-02-12", "Module": "Video"},
    {"Task": "Voice Swap con ElevenLabs", "Start": "2026-02-13", "Finish": "2026-02-14", "Module": "Video"},

    # --- MÓDULO: CARRUSEL ---
    {"Task": "Carrusel con Gemini (v1-v4)", "Start": "2026-01-12", "Finish": "2026-01-13", "Module": "Carrusel"},
    {"Task": "Procesamiento secuencial n8n", "Start": "2026-01-13", "Finish": "2026-01-14", "Module": "Carrusel"},
    {"Task": "Integración Trends → Carrusel", "Start": "2026-01-23", "Finish": "2026-01-26", "Module": "Carrusel"},
    {"Task": "Carrusel de 5 slides profesional", "Start": "2026-01-27", "Finish": "2026-01-28", "Module": "Carrusel"},
    {"Task": "Imágenes por slide (Gemini 3 Pro)", "Start": "2026-01-28", "Finish": "2026-02-05", "Module": "Carrusel"},
    {"Task": "Carrusel educativo dedicado", "Start": "2026-02-06", "Finish": "2026-02-07", "Module": "Carrusel"},
    {"Task": "Refinamiento visual de slides", "Start": "2026-02-05", "Finish": "2026-02-11", "Module": "Carrusel"},

    # --- MÓDULO: AUTOMATIZACIÓN Y CONTACTO CON LEADS ---
    {"Task": "Automatización según cronograma", "Start": "2026-02-16", "Finish": "2026-02-18", "Module": "Leads & Automatización"},
    {"Task": "Mejorar filtro de noticias (Trends)", "Start": "2026-02-16", "Finish": "2026-02-20", "Module": "Leads & Automatización"},
    {"Task": "Utilizar VEO 3.1", "Start": "2026-02-20", "Finish": "2026-02-28", "Module": "Leads & Automatización"},
    {"Task": "Investigación de Apollo", "Start": "2026-02-18", "Finish": "2026-02-28", "Module": "Leads & Automatización"},
    {"Task": "Scrapeo perfiles LinkedIn", "Start": "2026-02-18", "Finish": "2026-02-28", "Module": "Leads & Automatización"},
    {"Task": "Integración Apollo + LinkedIn + BD", "Start": "2026-02-22", "Finish": "2026-02-28", "Module": "Leads & Automatización"}
]

# Convertir la lista de diccionarios a un DataFrame de Pandas
df = pd.DataFrame(datos_gantt)

# Convertir los strings de fechas a objetos datetime
df['Start'] = pd.to_datetime(df['Start'])
df['Finish'] = pd.to_datetime(df['Finish'])

# Crear el gráfico de Gantt con Plotly
fig = px.timeline(
    df, 
    x_start="Start", 
    x_end="Finish", 
    y="Task", 
    color="Module",
    title="Roadmap de Desarrollo: Video, Carrusel y Automatización de Leads (Ene - Feb)",
    color_discrete_sequence=px.colors.qualitative.Pastel
)

# Invertir el eje Y para que las primeras tareas aparezcan arriba
fig.update_yaxes(autorange="reversed")

# Ajustar el formato del layout para que se vea limpio
fig.update_layout(
    xaxis_title="Fechas",
    yaxis_title="Tareas",
    font=dict(size=11),
    height=900,  # Altura ampliada para acomodar todas las tareas
    margin=dict(l=250, r=20, t=50, b=20) # Margen izquierdo para que los textos largos no se corten
)

# Mostrar el gráfico (esto abrirá una pestaña interactiva en tu navegador)
fig.show()