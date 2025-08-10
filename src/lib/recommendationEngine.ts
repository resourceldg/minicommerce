/**
 * Motor de Recomendaciones Inteligentes
 * Basado en análisis de comportamiento del usuario y patrones de compra
 */

import { CHECKOUT_CONFIG } from './checkoutConfig';

// Tipos para el sistema de recomendaciones
export interface UserBehavior {
	viewedProducts: string[]; // IDs de productos vistos
	purchasedProducts: string[]; // IDs de productos comprados
	cartAdditions: string[]; // IDs de productos agregados al carrito
	removedFromCart: string[]; // IDs de productos removidos del carrito
	timeSpentOnCategories: Record<string, number>; // Tiempo en cada categoría
	lastActivity: Date;
}

export interface ProductCorrelation {
	productId: string;
	correlatedWith: string[];
	strength: number; // 0-1, donde 1 es máxima correlación
	confidence: number; // 0-1, confianza en la correlación
}

export interface IntelligentRecommendation {
	product: any;
	reason: string;
	score: number; // 0-100, puntuación de relevancia
	type: 'collaborative' | 'content-based' | 'behavioral' | 'complementary';
	confidence: number;
}

// Clase principal del motor de recomendaciones
export class RecommendationEngine {
	private userBehavior: UserBehavior;
	private productCorrelations: Map<string, ProductCorrelation[]>;
	private readonly storageKey = 'minicommerce-user-behavior';

	constructor() {
		this.userBehavior = this.loadUserBehavior();
		this.productCorrelations = new Map();
		this.initializeCorrelations();
	}

	// Cargar comportamiento del usuario desde localStorage
	private loadUserBehavior(): UserBehavior {
		try {
			// Verificar si estamos en el cliente (browser) donde localStorage está disponible
			if (typeof window !== 'undefined' && window.localStorage) {
				const stored = localStorage.getItem(this.storageKey);
				if (stored) {
					const parsed = JSON.parse(stored);
					// Convertir lastActivity de string a Date
					if (parsed.lastActivity) {
						parsed.lastActivity = new Date(parsed.lastActivity);
					}
					return parsed;
				}
			}
		} catch (error) {
			console.warn('Error loading user behavior:', error);
		}

		return {
			viewedProducts: [],
			purchasedProducts: [],
			cartAdditions: [],
			removedFromCart: [],
			timeSpentOnCategories: {},
			lastActivity: new Date()
		};
	}

	// Guardar comportamiento del usuario en localStorage
	private saveUserBehavior(): void {
		try {
			// Verificar si estamos en el cliente (browser) donde localStorage está disponible
			if (typeof window !== 'undefined' && window.localStorage) {
				localStorage.setItem(this.storageKey, JSON.stringify(this.userBehavior));
			}
		} catch (error) {
			console.warn('Error saving user behavior:', error);
		}
	}

	// Inicializar correlaciones de productos basadas en datos históricos
	private initializeCorrelations(): void {
		// Correlaciones basadas en análisis de patrones de compra
		const correlations = {
			'sillas': [
				{ productId: 'mesas', strength: 0.9, confidence: 0.85 },
				{ productId: 'iluminacion', strength: 0.7, confidence: 0.75 },
				{ productId: 'decoracion', strength: 0.6, confidence: 0.70 }
			],
			'mesas': [
				{ productId: 'sillas', strength: 0.9, confidence: 0.85 },
				{ productId: 'decoracion', strength: 0.8, confidence: 0.80 },
				{ productId: 'iluminacion', strength: 0.7, confidence: 0.75 }
			],
			'muebles': [
				{ productId: 'iluminacion', strength: 0.8, confidence: 0.80 },
				{ productId: 'decoracion', strength: 0.7, confidence: 0.75 },
				{ productId: 'estanterias', strength: 0.6, confidence: 0.70 }
			],
			'iluminacion': [
				{ productId: 'muebles', strength: 0.8, confidence: 0.80 },
				{ productId: 'decoracion', strength: 0.7, confidence: 0.75 },
				{ productId: 'sillas', strength: 0.6, confidence: 0.70 }
			]
		};

		// Convertir a Map para acceso eficiente
		Object.entries(correlations).forEach(([category, corrs]) => {
			this.productCorrelations.set(category, corrs.map(corr => ({
				productId: corr.productId,
				correlatedWith: [category],
				strength: corr.strength,
				confidence: corr.confidence
			})));
		});
	}

	// Registrar producto visto por el usuario
	public recordProductView(productId: string, category: string): void {
		if (!this.userBehavior.viewedProducts.includes(productId)) {
			this.userBehavior.viewedProducts.push(productId);
		}
		
		// Actualizar tiempo en categoría
		this.userBehavior.timeSpentOnCategories[category] = 
			(this.userBehavior.timeSpentOnCategories[category] || 0) + 1;
		
		this.userBehavior.lastActivity = new Date();
		this.saveUserBehavior();
	}

	// Registrar producto agregado al carrito
	public recordCartAddition(productId: string, category: string): void {
		if (!this.userBehavior.cartAdditions.includes(productId)) {
			this.userBehavior.cartAdditions.push(productId);
		}
		
		// Actualizar tiempo en categoría
		this.userBehavior.timeSpentOnCategories[category] = 
			(this.userBehavior.timeSpentOnCategories[category] || 0) + 2; // Más peso para acciones
		
		this.userBehavior.lastActivity = new Date();
		this.saveUserBehavior();
	}

	// Registrar producto removido del carrito
	public recordCartRemoval(productId: string): void {
		if (!this.userBehavior.removedFromCart.includes(productId)) {
			this.userBehavior.removedFromCart.push(productId);
		}
		this.userBehavior.lastActivity = new Date();
		this.saveUserBehavior();
	}

	// Registrar compra completada
	public recordPurchase(productIds: string[]): void {
		productIds.forEach(id => {
			if (!this.userBehavior.purchasedProducts.includes(id)) {
				this.userBehavior.purchasedProducts.push(id);
			}
		});
		this.userBehavior.lastActivity = new Date();
		this.saveUserBehavior();
	}

	// Generar recomendaciones inteligentes
	public async generateRecommendations(
		currentCart: Array<{ item: any; quantity: number }>,
		allProducts: any[],
		maxRecommendations: number = 3
	): Promise<IntelligentRecommendation[]> {
		const recommendations: IntelligentRecommendation[] = [];
		const cartItemIds = currentCart.map(item => item.item.id);
		const cartCategories = [...new Set(currentCart.map(item => item.item.category))];

		// 1. Recomendaciones basadas en comportamiento del usuario
		const behavioralRecs = this.getBehavioralRecommendations(allProducts, cartItemIds);
		recommendations.push(...behavioralRecs);

		// 2. Recomendaciones basadas en contenido (categorías complementarias)
		const contentRecs = this.getContentBasedRecommendations(allProducts, cartCategories, cartItemIds);
		recommendations.push(...contentRecs);

		// 3. Recomendaciones colaborativas (productos frecuentemente comprados juntos)
		const collaborativeRecs = this.getCollaborativeRecommendations(allProducts, cartItemIds);
		recommendations.push(...collaborativeRecs);

		// Combinar y ordenar por score
		const uniqueRecommendations = this.removeDuplicateRecommendations(recommendations);
		const sortedRecommendations = uniqueRecommendations
			.sort((a, b) => b.score - a.score)
			.slice(0, maxRecommendations);

		return sortedRecommendations;
	}

	// Recomendaciones basadas en comportamiento del usuario
	private getBehavioralRecommendations(allProducts: any[], excludeIds: string[]): IntelligentRecommendation[] {
		const recs: IntelligentRecommendation[] = [];
		
		// Productos vistos frecuentemente
		const viewedCounts = this.userBehavior.viewedProducts.reduce((acc, id) => {
			acc[id] = (acc[id] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Productos agregados al carrito frecuentemente
		const cartCounts = this.userBehavior.cartAdditions.reduce((acc, id) => {
			acc[id] = (acc[id] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		allProducts.forEach(product => {
			if (excludeIds.includes(product.id)) return;

			let score = 0;
			let reason = '';

			// Score basado en productos vistos
			if (viewedCounts[product.id]) {
				score += viewedCounts[product.id] * 10;
				reason += `Visto ${viewedCounts[product.id]} veces. `;
			}

			// Score basado en productos agregados al carrito
			if (cartCounts[product.id]) {
				score += cartCounts[product.id] * 20;
				reason += `Agregado al carrito ${cartCounts[product.id]} veces. `;
			}

			// Score basado en tiempo en categoría
			const categoryTime = this.userBehavior.timeSpentOnCategories[product.category] || 0;
			if (categoryTime > 0) {
				score += categoryTime * 5;
				reason += `Interés en categoría ${product.category}. `;
			}

			if (score > 0) {
				recs.push({
					product,
					reason: reason.trim(),
					score: Math.min(score, 100),
					type: 'behavioral',
					confidence: Math.min(score / 100, 0.9)
				});
			}
		});

		return recs;
	}

	// Recomendaciones basadas en contenido (categorías complementarias)
	private getContentBasedRecommendations(
		allProducts: any[], 
		cartCategories: string[], 
		excludeIds: string[]
	): IntelligentRecommendation[] {
		const recs: IntelligentRecommendation[] = [];
		
		cartCategories.forEach(category => {
			const complementaryCategories = CHECKOUT_CONFIG.COMPLEMENTARY_PRODUCTS[category] || [];
			
			complementaryCategories.forEach(compCategory => {
				const productsInCategory = allProducts.filter(p => 
					p.category === compCategory && !excludeIds.includes(p.id)
				);

				productsInCategory.forEach(product => {
					recs.push({
						product,
						reason: `Complementa tu ${category}`,
						score: 70,
						type: 'content-based',
						confidence: 0.8
					});
				});
			});
		});

		return recs;
	}

	// Recomendaciones colaborativas (productos comprados juntos)
	private getCollaborativeRecommendations(allProducts: any[], excludeIds: string[]): IntelligentRecommendation[] {
		const recs: IntelligentRecommendation[] = [];
		
		// Simular análisis de productos comprados juntos
		// En un sistema real, esto vendría de análisis de datos históricos
		const frequentlyBoughtTogether = [
			{ from: 'sillas', to: 'mesas', strength: 0.9 },
			{ from: 'mesas', to: 'decoracion', strength: 0.8 },
			{ from: 'muebles', to: 'iluminacion', strength: 0.8 }
		];

		frequentlyBoughtTogether.forEach(({ from, to, strength }) => {
			const productsInCategory = allProducts.filter(p => 
				p.category === to && !excludeIds.includes(p.id)
			);

			productsInCategory.forEach(product => {
				recs.push({
					product,
					reason: `Frecuentemente comprado con ${from}`,
					score: Math.floor(strength * 80),
					type: 'collaborative',
					confidence: strength
				});
			});
		});

		return recs;
	}

	// Remover recomendaciones duplicadas
	private removeDuplicateRecommendations(recommendations: IntelligentRecommendation[]): IntelligentRecommendation[] {
		const seen = new Set();
		return recommendations.filter(rec => {
			if (seen.has(rec.product.id)) {
				return false;
			}
			seen.add(rec.product.id);
			return true;
		});
	}

	// Obtener estadísticas del usuario
	public getUserStats(): {
		totalProductsViewed: number;
		totalProductsPurchased: number;
		favoriteCategory: string;
		engagementScore: number;
	} {
		const totalProductsViewed = this.userBehavior.viewedProducts.length;
		const totalProductsPurchased = this.userBehavior.purchasedProducts.length;
		
		// Categoría favorita basada en tiempo
		const favoriteCategory = Object.entries(this.userBehavior.timeSpentOnCategories)
			.sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
		
		// Score de engagement (0-100)
		const engagementScore = Math.min(
			(totalProductsViewed * 10) + (totalProductsPurchased * 20) + 
			(Object.values(this.userBehavior.timeSpentOnCategories).reduce((a, b) => a + b, 0) * 2),
			100
		);

		return {
			totalProductsViewed,
			totalProductsPurchased,
			favoriteCategory,
			engagementScore
		};
	}

	// Limpiar datos antiguos (mantener solo últimos 30 días)
	public cleanupOldData(): void {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		if (this.userBehavior.lastActivity < thirtyDaysAgo) {
			// Resetear comportamiento si es muy antiguo
			this.userBehavior = {
				viewedProducts: [],
				purchasedProducts: [],
				cartAdditions: [],
				removedFromCart: [],
				timeSpentOnCategories: {},
				lastActivity: new Date()
			};
			this.saveUserBehavior();
		}
	}
}

// Instancia global del motor de recomendaciones
export const recommendationEngine = new RecommendationEngine(); 