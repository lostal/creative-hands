# 🔮 GraphQL API - Creative Hands

Endpoint: `https://creative-hands-cjzg.onrender.com/graphql`

---

## Queries

### Listar todos los productos

```powershell
(Invoke-RestMethod -Uri "https://creative-hands-cjzg.onrender.com/graphql" -Method POST -ContentType "application/json" -Body '{"query":"{ products { _id name price stock } }"}').data.products | Format-Table
```

### Obtener producto por ID

```powershell
(Invoke-RestMethod -Uri "https://creative-hands-cjzg.onrender.com/graphql" -Method POST -ContentType "application/json" -Body '{"query":"{ product(id: \"ID_PRODUCTO\") { _id name description price stock } }"}').data.product | Format-List
```

### Mis pedidos (requiere autenticación)

```powershell
(Invoke-RestMethod -Uri "https://creative-hands-cjzg.onrender.com/graphql" -Method POST -ContentType "application/json" -Body '{"query":"{ myOrders { _id totalPrice status createdAt } }"}').data.myOrders | Format-Table
```

### Todos los pedidos (solo admin)

```powershell
(Invoke-RestMethod -Uri "https://creative-hands-cjzg.onrender.com/graphql" -Method POST -ContentType "application/json" -Body '{"query":"{ orders { _id totalPrice status createdAt } }"}').data.orders | Format-Table
```

### Obtener pedido por ID

```powershell
(Invoke-RestMethod -Uri "https://creative-hands-cjzg.onrender.com/graphql" -Method POST -ContentType "application/json" -Body '{"query":"{ order(id: \"ID_PEDIDO\") { _id totalPrice status } }"}').data.order | Format-List
```

---

## Mutations

### Crear pedido (requiere autenticación)

```powershell
(Invoke-RestMethod -Uri "https://creative-hands-cjzg.onrender.com/graphql" -Method POST -ContentType "application/json" -Body '{"query":"mutation { createOrder(input: { orderItems: [{ product: \"ID_PRODUCTO\", name: \"Nombre\", quantity: 1, price: 10 }], shippingAddress: { address: \"Calle 123\", city: \"Madrid\", postalCode: \"28001\", phone: \"600123456\" } }) { _id totalPrice status } }"}').data.createOrder | Format-List
```

### Actualizar estado pedido (solo admin)

```powershell
(Invoke-RestMethod -Uri "https://creative-hands-cjzg.onrender.com/graphql" -Method POST -ContentType "application/json" -Body '{"query":"mutation { updateOrderStatus(id: \"ID_PEDIDO\", status: \"completed\") { _id status } }"}').data.updateOrderStatus | Format-List
```
