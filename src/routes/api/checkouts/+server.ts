import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { sql } from '@vercel/postgres';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { items, customerInfo } = await request.json();
		
		// Validaciones básicas
		if (!items || !Array.isArray(items) || items.length === 0) {
			return json({ 
				success: false, 
				error: 'items es requerido y debe ser un array no vacío' 
			}, { status: 400 });
		}
		
		// Validar cada item
		for (const item of items) {
			if (!item.productId || !item.quantity || item.quantity < 1) {
				return json({ 
					success: false, 
					error: 'Cada item debe tener productId y quantity válidos' 
				}, { status: 400 });
			}
		}
		
		// Verificar stock para todos los productos
		for (const item of items) {
			const productResult = await sql`
				SELECT id, name, stock_quantity, is_available
				FROM products 
				WHERE id = ${item.productId} AND is_available = true
			`;
			
			if (productResult.rows.length === 0) {
				return json({ 
					success: false, 
					error: `Producto ${item.productId} no encontrado o no disponible` 
				}, { status: 404 });
			}
			
			const product = productResult.rows[0];
			
			if (product.stock_quantity < item.quantity) {
				return json({ 
					success: false, 
					error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock_quantity}, Solicitado: ${item.quantity}` 
				}, { status: 400 });
			}
		}
		
		// Generar código único de checkout
		const checkoutCode = 'RM' + Date.now() + Math.floor(Math.random() * 1000);
		
		// Crear checkout principal
		const checkoutResult = await sql`
			INSERT INTO checkouts (
				checkout_code,
				customer_name,
				customer_phone,
				customer_email,
				total_amount
			) VALUES (
				${checkoutCode},
				${customerInfo?.name || null},
				${customerInfo?.phone || null},
				${customerInfo?.email || null},
				0
			) RETURNING id, checkout_code
		`;
		
		const checkout = checkoutResult.rows[0];
		
		// Procesar cada item
		let totalAmount = 0;
		const productDetails = [];
		
		for (const item of items) {
			const productResult = await sql`
				SELECT id, name, price, stock_quantity
				FROM products 
				WHERE id = ${item.productId}
			`;
			
			const product = productResult.rows[0];
			const subtotal = product.price * item.quantity;
			totalAmount += subtotal;
			
			// Agregar item al checkout
			await sql`
				INSERT INTO checkout_items (
					checkout_id, 
					product_id, 
					quantity, 
					unit_price, 
					subtotal
				) VALUES (
					${checkout.id},
					${item.productId},
					${item.quantity},
					${product.price},
					${subtotal}
				)
			`;
			
			// Reservar stock
			await sql`
				UPDATE products 
				SET stock_quantity = stock_quantity - ${item.quantity}
				WHERE id = ${item.productId}
			`;
			
			// Registrar en logs
			await sql`
				INSERT INTO stock_logs (
					product_id, 
					action, 
					quantity, 
					previous_stock, 
					new_stock, 
					checkout_id, 
					notes
				) VALUES (
					${item.productId},
					'reserved',
					${item.quantity},
					${product.stock_quantity},
					${product.stock_quantity - item.quantity},
					${checkout.id},
					'Stock reservado para checkout'
				)
			`;
			
			productDetails.push({
				name: product.name,
				price: product.price,
				quantity: item.quantity,
				subtotal: subtotal
			});
		}
		
		// Actualizar total del checkout
		await sql`
			UPDATE checkouts 
			SET total_amount = ${totalAmount}
			WHERE id = ${checkout.id}
		`;
		
		// Preparar mensaje para WhatsApp
		const productsList = productDetails.map(p => 
			`🪑 ${p.name} - $${p.price} x${p.quantity}`
		).join('\n');
		
		const whatsappMessage = `🛒 **NUEVA COMPRA - Rare&Magic**

Productos seleccionados:
${productsList}

💰 **Total: $${totalAmount}**

📱 Cliente: ${customerInfo?.name || 'No especificado'}
📧 Email: ${customerInfo?.email || 'No especificado'}
🌐 Origen: https://raremagic.com

⏰ Checkout creado: ${new Date().toLocaleString('es-ES')}
🔗 Código: ${checkout.checkout_code}

💬 **Gestiona pago y logística por WhatsApp**`;
		
		// TODO: Aquí se integraría con WhatsApp Business API
		// Por ahora solo simulamos el envío
		console.log('📱 MENSAJE PARA WHATSAPP:');
		console.log(whatsappMessage);
		
		// Marcar como enviado por WhatsApp
		await sql`
			UPDATE checkouts 
			SET whatsapp_sent = true, whatsapp_message_id = 'simulated_${Date.now()}'
			WHERE id = ${checkout.id}
		`;
		
		return json({
			success: true,
			checkout: {
				id: checkout.id,
				code: checkout.checkout_code,
				totalAmount: totalAmount,
				items: productDetails,
				whatsappMessage: whatsappMessage
			},
			message: 'Checkout creado exitosamente. Mensaje enviado a WhatsApp Business.'
		});
		
	} catch (error) {
		console.error('❌ Error creando checkout:', error);
		return json({ 
			success: false, 
			error: 'Error interno del servidor' 
		}, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const checkoutCode = url.searchParams.get('code');
		
		if (!checkoutCode) {
			return json({ 
				success: false, 
				error: 'Código de checkout requerido' 
			}, { status: 400 });
		}
		
		// Obtener información del checkout
		const checkoutResult = await sql`
			SELECT 
				c.id,
				c.checkout_code,
				c.total_amount,
				c.status,
				c.customer_name,
				c.customer_phone,
				c.customer_email,
				c.created_at
			FROM checkouts c
			WHERE c.checkout_code = ${checkoutCode}
		`;
		
		if (checkoutResult.rows.length === 0) {
			return json({ 
				success: false, 
				error: 'Checkout no encontrado' 
			}, { status: 404 });
		}
		
		const checkout = checkoutResult.rows[0];
		
		// Obtener items del checkout
		const itemsResult = await sql`
			SELECT 
				ci.quantity,
				ci.unit_price,
				ci.subtotal,
				p.name as product_name,
				p.description as product_description,
				p.image_url as product_image
			FROM checkout_items ci
			JOIN products p ON ci.product_id = p.id
			WHERE ci.checkout_id = ${checkout.id}
			ORDER BY ci.id ASC
		`;
		
		const checkoutWithItems = {
			...checkout,
			items: itemsResult.rows
		};
		
		return json({
			success: true,
			checkout: checkoutWithItems
		});
		
	} catch (error) {
		console.error('❌ Error obteniendo checkout:', error);
		return json({ 
			success: false, 
			error: 'Error interno del servidor' 
		}, { status: 500 });
	}
}; 