const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
try {
  const products = await Product.findAll({
    include: [
      { model: Category },
      { model: Tag, through: ProductTag },
    ],
  });
  res.status(200).json(products);
} catch (err) {
  res.status(500).json(err);
}
});

// get one product by its 'id' value
router.get('/:id', async (req, res) => {
try {
  const product = await Product.findByPk(req.params.id, {
    include: [
      { model: Category },
      { model: Tag, through: ProductTag },
    ],
  });
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.status(200).json(product);
} catch (err) {
  res.status(500).json(err);
}
});

// create new product
router.post('/', async (req, res) => {
try {
  const newProduct = await Product.create(req.body);

  if (req.body.tagIds && req.body.tagIds.length) {
    const productTagIdArr = req.body.tagIds.map((tag_id) => {
      return {
        product_id: newProduct.id,
        tag_id,
      };
    });
    await ProductTag.bulkCreate(productTagIdArr);
  }
  res.status(201).json(newProduct);
} catch (err) {
  res.status(400).json(err);
}

});

// update product
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      // Remove existing product tags
      await ProductTag.destroy({
        where: {
          product_id: req.params.id,
        },
      });

      // Create new product tags
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
