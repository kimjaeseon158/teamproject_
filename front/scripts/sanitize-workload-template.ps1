param(
  [string]$TemplatePath = "public/templates/workload_template.xlsx"
)

$ErrorActionPreference = "Stop"
$resolvedTemplate = (Resolve-Path -LiteralPath $TemplatePath).Path
$expectedRoot = (Resolve-Path -LiteralPath "public/templates").Path
if (-not $resolvedTemplate.StartsWith($expectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Template path must stay inside public/templates."
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("workload-template-" + [guid]::NewGuid())
$extractPath = Join-Path $temporaryRoot "source"
$outputPath = Join-Path $temporaryRoot "workload_template.xlsx"
New-Item -ItemType Directory -Path $extractPath -Force | Out-Null

try {
  [System.IO.Compression.ZipFile]::ExtractToDirectory($resolvedTemplate, $extractPath)

  $workbookPath = Join-Path $extractPath "xl/workbook.xml"
  [xml]$workbook = Get-Content -Raw -LiteralPath $workbookPath
  $workbookNs = New-Object System.Xml.XmlNamespaceManager($workbook.NameTable)
  $workbookNs.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
  @($workbook.SelectNodes("/x:workbook/x:externalReferences | /x:workbook/x:definedNames", $workbookNs)) |
    ForEach-Object { [void]$_.ParentNode.RemoveChild($_) }
  $workbook.Save($workbookPath)

  $relationshipsPath = Join-Path $extractPath "xl/_rels/workbook.xml.rels"
  [xml]$relationships = Get-Content -Raw -LiteralPath $relationshipsPath
  $relationshipNs = New-Object System.Xml.XmlNamespaceManager($relationships.NameTable)
  $relationshipNs.AddNamespace("r", "http://schemas.openxmlformats.org/package/2006/relationships")
  @($relationships.SelectNodes("/r:Relationships/r:Relationship[contains(@Type, '/externalLink') or contains(@Type, '/calcChain')]", $relationshipNs)) |
    ForEach-Object { [void]$_.ParentNode.RemoveChild($_) }
  $relationships.Save($relationshipsPath)

  $contentTypesPath = Join-Path $extractPath "[Content_Types].xml"
  [xml]$contentTypes = Get-Content -Raw -LiteralPath $contentTypesPath
  $contentNs = New-Object System.Xml.XmlNamespaceManager($contentTypes.NameTable)
  $contentNs.AddNamespace("c", "http://schemas.openxmlformats.org/package/2006/content-types")
  @($contentTypes.SelectNodes("/c:Types/c:Override[contains(@PartName, '/externalLinks/') or @PartName='/xl/calcChain.xml']", $contentNs)) |
    ForEach-Object { [void]$_.ParentNode.RemoveChild($_) }
  $contentTypes.Save($contentTypesPath)

  Remove-Item -LiteralPath (Join-Path $extractPath "xl/externalLinks") -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath (Join-Path $extractPath "xl/calcChain.xml") -Force -ErrorAction SilentlyContinue

  [System.IO.Compression.ZipFile]::CreateFromDirectory(
    $extractPath,
    $outputPath,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
  )

  $archive = [System.IO.Compression.ZipFile]::OpenRead($outputPath)
  try {
    if (-not ($archive.Entries | Where-Object FullName -eq "xl/workbook.xml")) {
      throw "Sanitized workbook is missing xl/workbook.xml."
    }
  } finally {
    $archive.Dispose()
  }

  Copy-Item -LiteralPath $outputPath -Destination $resolvedTemplate -Force
} finally {
  Remove-Item -LiteralPath $temporaryRoot -Recurse -Force -ErrorAction SilentlyContinue
}
