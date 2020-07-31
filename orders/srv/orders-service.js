const cds = require('@sap/cds')

module.exports = cds.service.impl(function() {

  const { Books } = cds.entities

  // Reduce stock of ordered books if available stock suffices
  this.before ('CREATE', 'Orders', async (req) => {
    const { Items: OrderItems } = req.data
    const tx = cds.transaction(req)
    const result = await Promise.all (OrderItems.map (order => tx.run (
      UPDATE (Books) .where ('ID =', order.book_ID)
      .and ('stock >=', order.amount)
      .set ('stock -=', order.amount)
    )) )
    result.forEach ((affectedRows,i) => {
      if (affectedRows === 0)  req.error (409,
        `${OrderItems[i].amount} exceeds stock for book #${OrderItems[i].book_ID}`
      )
    })
  })

})
