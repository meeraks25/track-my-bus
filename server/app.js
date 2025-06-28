// Driver login endpoint
app.post('/auth/driver-login', async (req, res) => {
  const { name, phone } = req.body;
  let queryRef = db.ref('/drivers');
  let snapshot;
  if (name) {
    snapshot = await queryRef.orderByChild('name').equalTo(name).once('value');
  } else if (phone) {
    snapshot = await queryRef.orderByChild('phone').equalTo(phone).once('value');
  } else {
    return res.status(400).json({ error: 'Name or phone required' });
  }
  const driverData = snapshot.val();
  if (driverData) {
    const driver = Object.values(driverData)[0];
    const busSnapshot = await db.ref(`/buses/${driver.busId}`).once('value');
    const routeSnapshot = await db.ref(`/routes/${driver.busId}`).once('value');
    res.json({ driver, bus: busSnapshot.val(), route: routeSnapshot.val() });
  } else {
    res.status(404).json({ error: 'Driver not found' });
  }
}); 