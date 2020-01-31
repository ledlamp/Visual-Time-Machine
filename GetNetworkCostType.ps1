[void][Windows.Networking.Connectivity.NetworkInformation,Windows,ContentType=WindowsRuntime]
$connectionProfile=[Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
$connectionCost=$connectionProfile.GetConnectionCost()
$networkCostType=$connectionCost.NetworkCostType
Write-Output $networkCostType