import {
  createTransferService,
  updateTransferService,
  listTransfersService,
  findTransferByIdService,
  getMyTransfersService,
  deleteTransferService,
} from "../services/transferService.js";

/**
 * Create a new Transfer Request
 */
export const createTransfer = async (req, res) => {
  try {
    const requesterSocialId = req.body.requesterSocialId;
    const data = req.body;

    const transfer = await createTransferService(data, requesterSocialId);
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update Transfer Request
 */
export const updateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await updateTransferService(id, updates);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * List all Transfers
 */
export const listTransfers = async (req, res) => {
  try {
    const { page, limit, filter } = req.query;

    const result = await listTransfersService({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      filter: filter ? JSON.parse(filter) : {},
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get Transfer by ID
 */
export const findTransferById = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await findTransferByIdService(id);

    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfer not found." });
    }

    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get Transfers of a specific user
 */
export const getMyTransfers = async (req, res) => {
  try {
    const userSocialId = req.params.userSocialId;
    const { page, limit, filter } = req.query;

    const result = await getMyTransfersService(userSocialId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      filter: filter ? JSON.parse(filter) : {},
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete Transfer
 */
export const deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTransferService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
