Write-Host "Testing API with Klein routing..." -ForegroundColor Cyan

$baseUrl = "http://localhost:4005"

# Function to make API requests
function Invoke-ApiRequest {
    param (
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Description = ""
    )
    
    Write-Host "`n$Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    Write-Host "Method: $Method" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body -ne $null -and $Method -ne "GET") {
            $jsonBody = $Body | ConvertTo-Json
            $params.Add("Body", $jsonBody)
        }
        
        $response = Invoke-WebRequest @params
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Green
        $content | ConvertTo-Json -Depth 4 | Write-Host
        
        return $content
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
            
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $reader.BaseStream.Position = 0
                $reader.DiscardBufferedData()
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response Body: $responseBody" -ForegroundColor Red
            }
            catch {
                Write-Host "Could not read error response body: $_" -ForegroundColor Red
            }
        }
    }
}

# Test root endpoint
Invoke-ApiRequest -Url "$baseUrl" -Method "GET" -Description "Testing root endpoint (API info)"

# Test invalid endpoint
Invoke-ApiRequest -Url "$baseUrl/invalid" -Method "GET" -Description "Testing invalid endpoint"

# Test if server is running with Klein router
Write-Host "`nAPI testing completed." -ForegroundColor Cyan
Write-Host "If you received proper JSON responses, the Klein router is working correctly." -ForegroundColor Cyan
Write-Host "If you received HTML error pages, the Klein router may not be properly configured." -ForegroundColor Cyan 