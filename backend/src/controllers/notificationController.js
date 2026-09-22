import Notification from '../models/Notification.js';

// Obtenir les notifications de l'utilisateur connecté
export const getNotifications = async (req, res) => {
  try {
    const role = req.utilisateur.role;
    const notifications = await Notification.find({ destinataire: role })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Compter les notifications non lues
export const getNombreNonLues = async (req, res) => {
  try {
    const role = req.utilisateur.role;
    const count = await Notification.countDocuments({
      destinataire: role,
      lu: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Marquer une notification comme lue
export const marquerLue = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { lu: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Marquer TOUTES les notifications comme lues
export const marquerToutesLues = async (req, res) => {
  try {
    const role = req.utilisateur.role;
    await Notification.updateMany(
      { destinataire: role, lu: false },
      { lu: true }
    );
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une notification
export const supprimerNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== FONCTION UTILITAIRE ==========
export const creerNotification = async (type, titre, message, data = {}) => {
  try {
    await Notification.create({
      destinataire: 'Proprietaire',
      type,
      titre,
      message,
      data,
    });
  } catch (error) {
    console.error('Erreur création notification :', error);
  }
};