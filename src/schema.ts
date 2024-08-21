import { randomUUID } from 'crypto'
import { createSchema } from 'graphql-yoga'

type Product = {
  id: string,
  title: string,
  stock: number,
  price: number
}

type Cart = {
  id: string,
  lines: CartLine[]
}
type CartLine = {
  id: string,
  product: Product,
  qty: number
}
type QueryCart = Cart & {
  lineCount: number,
  total: number
}

type UpdateProductInput = Product
type AddProductToCartInput = {
  cartId: string,
  productId: string,
  qty: number
}

const products: Product[] = [
  {
    id: "8bceb990-9335-403b-9056-496f275cb8f4",
    title: 'BR120',
    stock: 48923,
    price: 5.17
  },
  {
    id: randomUUID(),
    title: 'Battery',
    stock: 4100,
    price: 10.50
  },
  {
    id: randomUUID(),
    title: 'Oil Funnel',
    stock: 1410,
    price: 2.18
  },
  {
    id: randomUUID(),
    title: 'Wrench',
    stock: 2001,
    price: 5.43
  }
]

const carts: Cart[] = [
  {
    id: '5a797e70-cdba-4738-b7a5-ca6a63a2ddc0',
    lines: [
      {
        id: randomUUID(),
        product: products[0],
        qty: 5,
      }
    ],
  }
]

function calculateCart(cart: Cart): QueryCart {
  const lineCount = cart.lines.length;
  const total = cart.lines.reduce((sum, line) => sum + (line.product.price * line.qty), 0);
  return {
    ...cart,
    lineCount,
    total
  };
}

function getCarts (): QueryCart[] {
  return carts.map(cart => {
    return calculateCart(cart)
  })
}

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Product {
      id: ID!,
      title: String!,
      stock: Int!,
      price: Float!
    }
    type Cart {
      id: ID!,
      lines: [CartLine]!,
      lineCount: Int!,
      total: Float!
    }
    type CartLine {
      id: ID!,
      product: Product!,
      qty: Int!
      total: Int!,
    }
    input UpdateProductInput {
      id: ID!,
      title: String!,
      stock: Int!,
      price: Float!
    }
    input AddProductToCartInput {
      cartId: ID!,
      productId: ID!,
      qty: Int!
    }
    type Query {
      products: [Product!]!,
      carts: [Cart!]!
    }
    type Mutation {
      updateProduct(input: UpdateProductInput!): Product!,
      addProductToCart(input: AddProductToCartInput!): [Cart]!
    }
  `,
  resolvers: {
    Query: {
      products: () => products,
      carts: () => getCarts()
    },
    Mutation: {
      updateProduct: (parent: unknown, args: { input: UpdateProductInput }) => {
        const productId = args.input.id
        let productRecord = products.findIndex(pro => {
          return pro.id === productId
        })

        if (productRecord !== -1) {
          products[productRecord] = args.input
        } else {
          products.push(args.input)
          return args.input
        }
        return products[productRecord]
      },
      addProductToCart: (parent: unknown, args: { input: AddProductToCartInput }) => {
        const { cartId, productId, qty } = args.input
        const cart = carts.find(cart => cart.id === cartId)
        const product = products.find(product => product.id === productId)

        if (!cart || !product) {
          throw new Error('Cart or Product not found')
        }


        const isInCart = cart.lines.find(line => line.product.id === product.id)
        if (isInCart) {
          isInCart.qty = isInCart.qty + qty
          return getCarts()
        }
        const cartLine: CartLine = {
          id: randomUUID(),
          product,
          qty
        }

        cart.lines.push(cartLine)
        return getCarts()
      }
    }
  }
})
