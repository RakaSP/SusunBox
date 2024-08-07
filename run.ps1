# Start the subprocess
$subprocess = Start-Process -FilePath "powershell" -ArgumentList "-File run_sub.ps1" -PassThru

# Define a script block to handle cleanup on exit or interruption
$cleanupScript = {
    if ($subprocess -and !$subprocess.HasExited) {
        Write-Host "Stopping subprocess..."
        Stop-Process -Id $subprocess.Id -Force
    }
    Write-Host "Cleanup complete."
}

# Register the cleanup script block to run on process exit or interruption
Register-EngineEvent PowerShell.Exiting -Action $cleanupScript

# Main script work
Write-Host "Main script work done."
try {
    cd frontend
    npm run start
} catch {
    Write-Host "Script interrupted by Ctrl+C."
}

# Ensure cleanup script runs on normal exit
& $cleanupScript