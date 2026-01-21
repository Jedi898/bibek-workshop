import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { SceneBreakdown } from '../../components/scriptParser'

export const exportScenesToPDF = (scenes: SceneBreakdown[], filename: string = 'scene-breakdown.pdf') => {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Scene Breakdown Report', 20, 20)

  // Summary
  doc.setFontSize(12)
  doc.text(`Total Scenes: ${scenes.length}`, 20, 35)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45)

  // Scene Details Table
  const tableData = scenes.map(scene => [
    scene.sceneNumber,
    scene.heading,
    scene.location?.name || 'Unknown',
    scene.time || 'Unknown',
    scene.logistics?.characters?.join(', ') || 'None',
    scene.summary || 'No summary'
  ])

  ;(doc as any).autoTable({
    head: [['Scene #', 'Heading', 'Location', 'Time', 'Characters', 'Summary']],
    body: tableData,
    startY: 55,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 35 },
      5: { cellWidth: 'auto' }
    }
  })

  // Save the PDF
  doc.save(filename)
}
