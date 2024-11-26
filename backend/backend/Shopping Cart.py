class ShoppingCart:
    def __init__(self):
        self.cart = {}

    #def add_itemtoshop(self, item_name, price):
    #    self.item_name=item_name

    def add_itemtocart(self, item_name, price, quantity=1):
        if item_name in self.cart:
            self.cart[item_name]['quantity'] += quantity
        else:
            self.cart[item_name] = {'price': price, 'quantity': quantity}
        print(f"{quantity}x {item_name} added to cart.")

    def remove_item(self, item_name, quantity=1):
        if item_name in self.cart:
            if self.cart[item_name]['quantity'] > quantity:
                self.cart[item_name]['quantity'] -= quantity
                print(f"{quantity}x {item_name} removed from cart.")
            else:
                del self.cart[item_name]
                print(f"{item_name} removed from cart.")
        else:
            print(f"{item_name} is not in the cart.")

    def view_cart(self):
        if not self.cart:
            print("The shopping cart is empty.")
        else:
            print("\nShopping Cart Contents:")
            for item, details in self.cart.items():
                print(f"{item}: ${details['price']} x {details['quantity']}")

    def calculate_total(self):
        total = sum(details['price'] * details['quantity'] for details in self.cart.values())
        return total


class DiscountModule:
    def __init__(self):
        self.ranks = {
            "Bronze": 0.05,  # 5% discount
            "Silver": 0.10,  # 10% discount
            "Gold": 0.20     # 20% discount
        }

    def apply_discount(self, total, rank):
        discount_rate = self.ranks.get(rank, 0)  # Default to 0 if rank is invalid
        discount = total * discount_rate
        final_total = total - discount
        print(f"\nOriginal Total: ${total:.2f}")
        print(f"Discount: ${discount:.2f}")
        print(f"Final Total after Discount: ${final_total:.2f}")
        return final_total

class PaymentModule:
    def __init__(self):
        self.payment_methods = ["Nets", "Visa", "PayPal", "Cash"]

    def display_payment_methods(self):
        print("\nAvailable Payment Methods:")
        for num, method in enumerate(self.payment_methods, 1):
            print(f"{num}. {method}")

    def process_payment(self, amount, method_num):
        if method_num < 1 or method_num > len(self.payment_methods):
            print("Invalid payment method selected.")
            return False

        payment_method = self.payment_methods[method_num]
        print(f"\nProcessing payment of ${amount:.2f} using {payment_method}...")
        print("Payment successful. Thank you for your purchase!")
        return True


# Test
if __name__ == "__main__":
    cart = ShoppingCart()
    discount_module = DiscountModule()
    payment = PaymentModule()

    cart.add_itemtocart("Wet Wipes", 1.5, 4)
    cart.add_itemtocart("Soccer Ball", 20, 5)
    cart.add_itemtocart("50p Towel", 12)

    cart.remove_item("Wet Wipes", 2)

    cart.view_cart()

    total = cart.calculate_total()
    print(f"\nTotal: ${total:.2f}")

    rank = input("\nEnter your rank (Bronze, Silver, Gold): ").capitalize()
    total_with_discount = discount_module.apply_discount(total, rank)


    payment.display_payment_methods()

    try:
        method_num = int(input("\nEnter the number corresponding to your payment method: "))
        if payment.process_payment(total_with_discount, method_num):
            cart.cart.clear()
            print("\nYour cart is now empty.")
    except ValueError:
        print("Invalid input. Please enter a number.")
