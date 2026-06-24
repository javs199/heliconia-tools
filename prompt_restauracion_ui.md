# Prompt de Restauración de UI y Estilos de Impresión

*Guarda este archivo. Si en el futuro modificas la lógica interna de alguna de las herramientas (como el despiece de Gypsum o Plywood) y pierdes los ajustes estéticos y de impresión que habíamos logrado, simplemente cópiale este prompt a tu asistente IA para que restaure todo el aspecto visual sin romper tu nuevo código.*

---

**Copia el texto debajo de esta línea:**

> Acabo de actualizar este archivo HTML con nueva lógica, pero perdió las mejoras de UI y de impresión que habíamos estandarizado. Por favor, edita este archivo para aplicarle las 4 mejoras estándar del proyecto sin alterar mi nueva lógica matemática ni mis datos:
> 
> 1. **Botones de Unidades Globales:** Mueve el selector de unidades (`IN/CM`) al `header` principal de la página, implementando la función `setUnit(u)` y `fmtSize(cm, inch)` globalmente tal cual lo tienen los otros archivos.
> 2. **Texto Centrado y con Tamaño en el Canvas 2D:** Dentro de la función que dibuja el `<canvas>`, asegúrate de agregar `ctx.textAlign = 'center';` y `ctx.textBaseline = 'middle';` para que el texto quede centrado en el recorte. Además, el texto debe mostrar el número de pieza junto con su tamaño formateado, ejemplo: `const numberLabel = \`\${index + 1} (\${fmtSize(cut.size, cut.inch)})\`;`.
> 3. **Impresión Limpia (CSS @media print):** Inyecta el bloque exhaustivo de `@media print` al final del `<style>` que quita los fondos oscuros (`bg-slate-900` a `transparent`), fuerza el texto a negro/gris oscuro, elimina las sombras, e incluye `-webkit-print-color-adjust: exact !important;` y `print-color-adjust: exact !important;` para mantener los colores del canvas en el PDF final.
> 4. **Listas a 1 Columna (Sin Truncar):** En la parte donde se listan las piezas y en la Guía de Marcaje, cambia los contenedores de 2 columnas (`grid grid-cols-1 sm:grid-cols-2`) a una sola columna (`flex flex-col gap-1.5`). También, busca clases como `max-w-[200px] truncate` o `max-w-[210px] truncate` y cámbialas por `truncate pr-4` para que el texto de las descripciones largas no se corte al imprimir.
