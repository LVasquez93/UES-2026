import os, subprocess, pypdf

ps_script = """
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = (Get-Item 'Investigacion_CET115.docx').FullName
$pdfPath = (Get-Item '.').FullName + '\\Investigacion_CET115.pdf'
$doc = $word.Documents.Open($docPath)
$pages = $doc.ComputeStatistics(2)
Write-Host "Word computed pages: $pages"
$doc.SaveAs([ref]$pdfPath, [ref]17) # 17 = wdFormatPDF
$doc.Close()
$word.Quit()
"""
with open('export_pdf.ps1', 'w', encoding='utf-8') as f:
    f.write(ps_script)

res = subprocess.run(['powershell', '-ExecutionPolicy', 'Bypass', '-File', 'export_pdf.ps1'], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)

if os.path.exists('Investigacion_CET115.pdf'):
    reader = pypdf.PdfReader('Investigacion_CET115.pdf')
    total = len(reader.pages)
    print(f"PDF generated successfully with {total} pages!")
    for i, p in enumerate(reader.pages):
        words = len(p.extract_text().split())
        first_line = p.extract_text().strip().split('\n')[0] if p.extract_text().strip() else 'EMPTY'
        print(f"Page {i+1}: {words} words | {first_line[:65]}")
