'use strict';

const controller = {};
const { DataTypes } = require('sequelize');
const models = require('../models');

controller.checkout = async (req, res) => {
    if (req.session.cart.quantity > 0) {
        let userId = 1;
        res.locals.addresses = await models.Address.findAll({where: {userId}});
        res.locals.cart = req.session.cart.getCart();
        res.render('checkout');
    }
    else res.redirect('/products/');
}

controller.placeorders = async (req, res) => {
    let userId = 1;

    let addressId = isNaN(req.body.addressId) ? 0: parseInt(req.body.addressId);
    let address = await models.Address.findByPk(addressId);
    if (!address) {
        address = await models.Address.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobile: req.body.mobile,
            address: req.body.address,
            country: req.body.country,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode,
            isDefault: req.body.isDefault
        })
    }

    let cart = req.session.cart;
    cart.paymentMethod = req.body.payment;
    cart.shippingAddress = `${address.firstName} ${address.lastName},
    Email: ${address.email},
    Mobile: ${address.mobile},
    Address: ${address.address}, ${address.city}, ${address.country}, ${address.state}, ${address.zipCode}`;
    cart.payment = req.body.payment;

    switch (req.body.payment) {
        case 'PAYPAL':
                saveOrders(req, res, 'PAID');
            break;

        case 'COD':
                saveOrders(req, res, 'UNPAID');
            break;
    }

    // return res.redirect('/users/checkout');
}

async function saveOrders(req, res, status) {
    let userId = 1;
    let {items, ...others} = req.session.cart.getCart();
    let order = await models.Order.create({
        userId,
        ...others,
        status
    });
    let orderDetails = [];
    items.forEach(item => {
        orderDetails.push({
            orderId: order.id,
            productId: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
            total: item.total
        });
    });

    await models.OrderDetail.bulkCreate(orderDetails);
    req.session.cart.clear();
    res.render('error', {message: 'Thank you for you order!'});
}  

module.exports = controller;