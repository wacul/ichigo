window.addEventListener('load', function(e){
  var proxyClient = new ProxyClient()

  var box = new ControlBox()
  box.addEventListener("selectEndpoint", e => {
    proxyClient.updateOrigin(
      e["originName"],
      e["endpointKey"],
      function(origin: Origin){
        box.setOrigin(origin)
        location.reload(true)
      },
      function(err){
        console.error(err)
      }
    )
  })

  proxyClient.listOrigins(
    function(origins: Origin[]){
      for (var key in origins) {
        box.setOrigin(origins[key])
      }
      box.put(document.body)
    },
    function(err){
      console.error(err)
    }
  )
})
