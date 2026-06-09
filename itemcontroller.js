const Item = require("../models/Item");

const addItem = async (req, res) => {

    try {

        const item = await Item.create(req.body);

        res.status(201).json({
            message: "Item Added Successfully",
            item
        });

    }
    catch(error){

        res.status(500).json({
            message: error.message
        });

    }

};

const getItems = async (req, res) => {

    try {

        const items = await Item.find()
        .sort({ createdAt: -1 });

        res.status(200).json(items);

    }
    catch(error){

        res.status(500).json({
            message: error.message
        });

    }

};


const updateItem = async (req, res) => {
    try {

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: "Item updated successfully",
            item: updatedItem
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
const deleteItem = async (req, res) => {
    try {

        const deletedItem =
        await Item.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: "Item deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
module.exports = {
    addItem,
    getItems,
    updateItem,
    deleteItem
};