import { DEFAULT_IMAGES_COUNT, DEFAULT_VARIANTS_COUNT } from "@/constants/shopify";
import { reshapeProduct } from "@/lib/server-utils";
import { shopifyFetch } from "@/lib/shopify/client";
import type { Product } from "@/types/shared";
import type { ShopifyProductOperation } from "@/types/shopify";
import { print } from "graphql";
import gql from "graphql-tag";

class ProductService {
  async getProduct(handle: string): Promise<Product | null> {
    const query = gql`
      query getProduct($handle: String!, $imageCount: Int!, $variantCount: Int!) {
        product(handle: $handle) {
          id
          title
          description
          handle
          tags
          images(first: $imageCount) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: $variantCount) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await shopifyFetch<ShopifyProductOperation>({
        query: print(query),
        variables: {
          handle,
          imageCount: DEFAULT_IMAGES_COUNT,
          variantCount: DEFAULT_VARIANTS_COUNT,
        },
      });
      return reshapeProduct(response.body);
    } catch (error) {
      console.log("Error while fetching a product:", error);
      return null;
    }
  }
}

export const productService = new ProductService();
