import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileMenu from './components/layout/MobileMenu';
import Toast from './components/ui/Toast';
import ProductModal from './components/ProductModal';
import OrderHistory from './components/OrderHistory';
import Profile from './components/Profile';
import Wishlist from './components/Wishlist';
import { MOCK_PRODUCTS } from './constants';
import { Product, CartItem, User as UserType, Category, Address, Order } from './types';
import { GoogleGenAI } from "@google/genai";
import api from './services/api';
import { openRazorpayCheckout } from './services/razorpayService';
import { useLocation } from './hooks/useLocation';
import {
    HomePage,
    CatalogPage,
    CartPage,
    CheckoutPage,
    SuccessPage,
    LoginPage,
    SellerDashboard,
    AdminPanel
} from './pages';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('login');
    const [authChecked, setAuthChecked] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [user, setUser] = useState<UserType | null>(null);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [orderStatus, setOrderStatus] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [recipeIdea, setRecipeIdea] = useState<string>("");
    const [isRecipeLoading, setIsRecipeLoading] = useState(false);
    const [nearbyOnly, setNearbyOnly] = useState(false);
    const [nearbyProducts, setNearbyProducts] = useState<Product[]>([]);
    const [nearbyLoading, setNearbyLoading] = useState(false);

    const userLocation = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([
        { id: '1', label: 'Home', fullAddress: '123 Downtown, 5th Avenue, Apt 4B', isDefault: true },
        { id: '2', label: 'Office', fullAddress: '456 Business Park, Floor 12', isDefault: false }
    ]);

    // Fetch products based on search, category, and location filters
    const fetchProducts = useCallback(async () => {
        setNearbyLoading(true);
        const params: any = {};
        if (searchQuery) params.q = searchQuery;
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (nearbyOnly && userLocation.hasLocation && userLocation.latitude && userLocation.longitude) {
            params.latitude = userLocation.latitude;
            params.longitude = userLocation.longitude;
        }

        try {
            const data = await api.searchProducts(params);
            if (data.success && data.products) {
                const mapped = data.products.map((p: any) => ({
                    id: p._id || p.id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    category: p.category,
                    imageUrl: p.thumbnailUrl || p.imageUrls?.[0] || 'https://picsum.photos/seed/' + encodeURIComponent(p.name) + '/300/300',
                    sellerId: p.storeId?._id || p.storeId || '',
                    sellerName: p.storeId?.storeName || 'Local Store',
                    unit: p.unit || '1 pc',
                    stock: p.stock ?? 10,
                    distance: p.distance,
                }));
                if (nearbyOnly) {
                    setNearbyProducts(mapped);
                } else {
                    setProducts(mapped);
                    setNearbyProducts([]);
                }
            }
        } catch (error) {
            console.error("Search error:", error);
            if (nearbyOnly) setNearbyProducts([]);
            else setProducts([]);
        } finally {
            setNearbyLoading(false);
        }
    }, [searchQuery, selectedCategory, nearbyOnly, userLocation.hasLocation, userLocation.latitude, userLocation.longitude]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Filter products based on search and category
    const filteredProducts = useMemo(() => {
        if (nearbyOnly && nearbyProducts.length > 0) {
            return nearbyProducts;
        }
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory, nearbyOnly, nearbyProducts]);

    // Auto-login: check for existing token on mount
    useEffect(() => {
        const tryAutoLogin = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await api.getCurrentUser();
                    if (data.success && data.user) {
                        setUser({
                            id: data.user.id || data.user._id,
                            name: data.user.name,
                            email: data.user.email,
                            role: data.user.role,
                            phone: data.user.phone,
                            isVerified: data.user.isVerified,
                        });
                        setCurrentPage('home');
                    }
                } catch (e) {
                    localStorage.removeItem('token');
                }
            }
            setAuthChecked(true);
        };
        tryAutoLogin();
    }, []);

    // Persistence
    useEffect(() => {
        const savedCart = localStorage.getItem('localkart-cart');
        if (savedCart) setCart(JSON.parse(savedCart));

        const savedWishlist = localStorage.getItem('localkart-wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

        const savedOrders = localStorage.getItem('localkart-orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
    }, []);

    useEffect(() => {
        localStorage.setItem('localkart-cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('localkart-wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem('localkart-orders', JSON.stringify(orders));
    }, [orders]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showToast(`${product.name} added to cart!`, 'success');
    };

    const addToCartWithQuantity = (product: Product, quantity: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { ...product, quantity }];
        });
        showToast(`${product.name} added to cart!`, 'success');
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const toggleWishlist = (product: Product) => {
        setWishlist(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                showToast('Removed from wishlist', 'info');
                return prev.filter(p => p.id !== product.id);
            } else {
                showToast('Added to wishlist', 'success');
                return [...prev, product];
            }
        });
    };

    const isFavorite = (productId: string) => wishlist.some(p => p.id === productId);

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleLogin = (userData: UserType) => {
        setUser(userData);
        setCurrentPage('home');
    };

    const handleLogout = () => {
        setUser(null);
        api.logout();
        setCurrentPage('login');
    };

    const handleAddAddress = (address: Address) => {
        setAddresses(prev => [...prev, address]);
    };

    const handleDeleteAddress = (id: string) => {
        setAddresses(prev => prev.filter(a => a.id !== id));
    };

    const handleSetDefaultAddress = (id: string) => {
        setAddresses(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === id
        })));
    };

    const handleUpdateProfile = (updates: Partial<UserType>) => {
        if (user) {
            setUser({ ...user, ...updates });
            showToast('Profile updated!', 'success');
        }
    };

    const handleReorder = (items: CartItem[]) => {
        setCart(items);
        setCurrentPage('cart');
        showToast('Items added to cart!', 'success');
    };

    const generateRecipe = async () => {
        if (cart.length === 0) {
            alert("Add some items to your cart first for personalized ideas!");
            return;
        }
        setIsRecipeLoading(true);
        const items = cart.map(i => i.name).join(', ');
        try {
            const res = await api.generateAIContent(items, 'recipe_idea');
            if (res.success && res.text) {
                setRecipeIdea(res.text);
            } else {
                setRecipeIdea("Sorry, I couldn't generate a recipe right now.");
            }
        } catch (error) {
            console.error("Error generating recipe:", error);
            setRecipeIdea("Failed to generate recipe. Please try again.");
        } finally {
            setIsRecipeLoading(false);
        }
    };

    const handleOrder = async (deliveryDetails: { name: string, phone: string, address: string }) => {
        if (isProcessingPayment) return;

        if (paymentMethod === 'online') {
            setIsProcessingPayment(true);
            try {
                const paymentResponse = await openRazorpayCheckout({
                    amount: totalAmount,
                    customerName: deliveryDetails.name,
                    customerEmail: user?.email || '',
                    customerPhone: deliveryDetails.phone,
                    description: `LocalKart Order - ${cart.length} item${cart.length > 1 ? 's' : ''}`,
                });

                // Create Order payload for backend
                const newOrderPayload = {
                    items: cart.map(i => ({
                        productId: i.id,
                        quantity: i.quantity,
                    })),
                    deliveryAddress: {
                        fullAddress: deliveryDetails.address,
                        contactName: deliveryDetails.name,
                        contactPhone: deliveryDetails.phone,
                    },
                    paymentMethod: 'online',
                    paymentStatus: 'paid',
                    paymentId: paymentResponse.razorpay_payment_id,
                };

                const res = await api.createOrder(newOrderPayload);
                if (res.success && res.order) {
                    setOrders(prev => [res.order, ...prev]);
                    setCart([]);
                    setOrderStatus(1);
                    setCurrentPage('order-success');
                    showToast('Order placed successfully!', 'success');
                } else {
                    alert(res.message || 'Error processing order locally');
                }

            } catch (error: any) {
                if (error.message === 'Payment cancelled') {
                    showToast('Payment cancelled', 'info');
                } else {
                    showToast(error.message || 'Payment failed', 'error');
                }
            } finally {
                setIsProcessingPayment(false);
            }
        } else {
            // Cash on delivery
            setIsProcessingPayment(true);
            try {
                // Create Order payload for backend
                const newOrderPayload = {
                    items: cart.map(i => ({
                        productId: i.id,
                        quantity: i.quantity,
                    })),
                    deliveryAddress: {
                        fullAddress: deliveryDetails.address,
                        contactName: deliveryDetails.name,
                        contactPhone: deliveryDetails.phone,
                    },
                    paymentMethod: 'cod',
                    paymentStatus: 'pending',
                };

                const res = await api.createOrder(newOrderPayload);
                if (res.success && res.order) {
                    setOrders(prev => [res.order, ...prev]);
                    setCart([]);
                    setOrderStatus(1);
                    setCurrentPage('order-success');
                    showToast('Order placed successfully via COD!', 'success');
                } else {
                    alert(res.message || 'Error processing COD order');
                }
            } catch (error) {
                console.error("Order creation failed", error);
                alert("Failed to create order.");
            } finally {
                setIsProcessingPayment(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
            <Navbar
                onNavigate={(page) => { setCurrentPage(page); setIsMobileMenuOpen(false); }}
                cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
                user={user}
                onLogout={handleLogout}
                onMenuClick={() => setIsMobileMenuOpen(true)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                userLocation={userLocation}
            />
            <main className="flex-grow">
                {currentPage === 'home' && (
                    <HomePage
                        products={products}
                        cart={cart}
                        addToCart={addToCart}
                        toggleWishlist={toggleWishlist}
                        isFavorite={isFavorite}
                        setCurrentPage={setCurrentPage}
                        setSelectedProduct={setSelectedProduct}
                        setModalQuantity={setModalQuantity}
                        setSelectedCategory={setSelectedCategory}
                        recipeIdea={recipeIdea}
                        isRecipeLoading={isRecipeLoading}
                        generateRecipe={generateRecipe}
                    />
                )}
                {currentPage === 'catalog' && (
                    <CatalogPage
                        products={products}
                        filteredProducts={filteredProducts}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        addToCart={addToCart}
                        isFavorite={isFavorite}
                        toggleWishlist={toggleWishlist}
                        setSelectedProduct={setSelectedProduct}
                        setModalQuantity={setModalQuantity}
                        nearbyOnly={nearbyOnly}
                        setNearbyOnly={setNearbyOnly}
                        hasLocation={userLocation.hasLocation}
                        nearbyLoading={nearbyLoading}
                        onRequestLocation={userLocation.refresh}
                    />
                )}
                {currentPage === 'cart' && (
                    <CartPage
                        cart={cart}
                        totalAmount={totalAmount}
                        removeFromCart={removeFromCart}
                        updateQuantity={updateQuantity}
                        setCurrentPage={setCurrentPage}
                    />
                )}
                {currentPage === 'checkout' && (
                    <CheckoutPage
                        cart={cart}
                        totalAmount={totalAmount}
                        user={user}
                        addresses={addresses}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        isProcessingPayment={isProcessingPayment}
                        handleOrder={handleOrder}
                        setCurrentPage={setCurrentPage}
                    />
                )}
                {currentPage === 'success' && (
                    <SuccessPage
                        orderStatus={orderStatus}
                        setCurrentPage={setCurrentPage}
                        setCart={setCart}
                    />
                )}
                {currentPage === 'login' && (
                    <LoginPage handleLogin={handleLogin} />
                )}
                {currentPage === 'seller-dashboard' && (
                    <SellerDashboard products={products} user={user} setProducts={setProducts} onNavigate={setCurrentPage} />
                )}
                {currentPage === 'admin' && (
                    <AdminPanel user={user} onLogin={handleLogin} />
                )}
                {currentPage === 'orders' && <OrderHistory orders={orders} onReorder={handleReorder} onNavigate={setCurrentPage} />}
                {currentPage === 'profile' && user && <Profile user={user} addresses={addresses} onAddAddress={handleAddAddress} onDeleteAddress={handleDeleteAddress} onSetDefaultAddress={handleSetDefaultAddress} onUpdateProfile={handleUpdateProfile} onNavigate={setCurrentPage} />}
                {currentPage === 'wishlist' && <Wishlist items={wishlist} onRemoveFromWishlist={(id) => setWishlist(prev => prev.filter(p => p.id !== id))} onAddToCart={addToCart} onNavigate={setCurrentPage} />}
            </main>
            <Footer />

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                onNavigate={(page) => { setCurrentPage(page); setIsMobileMenuOpen(false); }}
                user={user}
                onLogout={handleLogout}
                cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
                userLocation={userLocation}
            />

            {/* Product Modal */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={(product) => addToCartWithQuantity(product, modalQuantity)}
                    quantity={modalQuantity}
                    onQuantityChange={(delta) => setModalQuantity(Math.max(1, modalQuantity + delta))}
                    isFavorite={isFavorite(selectedProduct.id)}
                    onToggleFavorite={() => toggleWishlist(selectedProduct)}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Firebase reCAPTCHA container (invisible) */}
            <div id="recaptcha-container"></div>
        </div>
    );
};

export default App;
