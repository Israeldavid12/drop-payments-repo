const pool = require('./postgres.js')




class DatabaseUtils {

  static async saveUserOnSupabase(uid, name, email) {
    const query = `
      INSERT INTO public.users (uid, name, email)
      VALUES ($1, $2, $3)
      RETURNING *;
    `

    try {
      const result = await pool.query(query, [uid, name, email])
      console.log('Usuário salvo:', result.rows[0])
      return true
    } catch (err) {
      console.error('Erro ao salvar usuário:', err.message)
      return false
    }
  }

  static async verificarEmail(email) {
    try {
      const query = 'SELECT 1 FROM auth.users WHERE email = $1 LIMIT 1';
      const result = await pool.query(query, [email]);
      console.log('Resultado da consulta:', result.rows);

      if (result.rowCount > 0) {
        console.log('E-mail já está cadastrado!');
        return true;
      } else {
        console.log('E-mail nao registado.');
        return false;
      }
    } catch (err) {
      console.error('Erro ao verificar e-mail:', err);
      return false;
    }
  }

  static async updateLastLogin(user_id) {
    try {
      const query = `
            UPDATE public.users
            SET last_login = NOW()
            WHERE uid = $1;
        `
      const result = await pool.query(query, [user_id])
      console.log('Ultimo login atualizado:', result.rowCount)
      return true
    } catch (err) {
      console.error('Erro ao atualizar ultimo login:', err.message)
      return false
    }
  }

  static async getUserBasicData(user_id) {
    const query = `
        SELECT 
          users.name, 
          users.email,
          users.national_id,
          users.contact, 
          user_balances.total_balance_mpesa_emola_live AS primary_balance, 
          user_balances.balance_paypal AS secundary_balance,
          user_balances.sales_today AS sales_today,
          sales.created_at AS created_at,
          sales.amount_paid AS amount,
          sales.status AS status,
          sales.payment_method AS payment_method,
          sales.sale_id AS sale_id,
          sales.buyer_name AS buyer_name,
          sales.buyer_email AS buyer_email,
          sales.buyer_phone AS buyer_phone,
          sales.product_id AS product_id,
          products.name AS product_name
        FROM users
        JOIN user_balances ON users.uid = user_balances.user_uid
        LEFT JOIN (
          SELECT DISTINCT ON (user_uid) * 
          FROM sales
          ORDER BY user_uid DESC
        ) sales ON users.uid = sales.user_uid
         LEFT JOIN products ON sales.product_id = products.product_uid
        WHERE users.uid = $1 LIMIT 1;
      `;

    try {
      // Executando a consulta com o parâmetro userUid
      const result = await pool.query(query, [user_id]);
      const data = result.rows[0];

      // Verificando se a consulta retornou resultados
      if (result.rows.length > 0) {
        const user_info = {
          name: data.name,
          email: data.email,
          national_id: data.national_id,
          contact: data.contact,
          primary_balance: data.primary_balance,
          secundary_balance: data.secundary_balance,
          sales_today: data.sales_today,
        };

        const last_sale = {
          created_at: data.created_at,
          amount: data.amount,
          status: data.status,
          payment_method: data.payment_method,
          sale_id: data.sale_id,
          product_name: data.product_name,
          buyer_name: data.buyer_name,
          buyer_email: data.buyer_email,
          buyer_phone: data.buyer_phone,
        };

         const sales_quantity = await pool.query("SELECT COUNT(*) AS total_sales FROM sales WHERE user_uid = $1", [user_id])



        const response = {
          user_info: user_info,
          last_sale: last_sale,
          ...sales_quantity.rows[0]
        };
        return response;
      } else {
        console.log('Nenhum dado encontrado.');
        return {
          code: 404,
          message: 'Nenhum dado encontrado.'
        };
      }
    } catch (err) {
      console.error('Erro na consulta:', err);
      throw err;
    }
  }

  static async getUserPayoutMethos(user_id) {
    const query = `
        SELECT * FROM public.payout_methods WHERE user_uid = $1;
      `;

    try {
      // Executando a consulta com o parâmetro userUid
      const result = await pool.query(query, [user_id]);
      const data = result.rows;

      // Verificando se a consulta retornou resultados
      if (result.rows.length > 0) {
        return data;
      } else {
        console.log('Nenhum metodo de pagamento encontrado.');
        return {
          code: 404,
          message: 'Nenhum metodo de pagamento encontrado.'
        };
      }
    } catch (err) {
      console.error('Erro na consulta:', err);
      throw err;
    }
  }


  static async deleteUserData(id, table) {
    const allowedTables = ['payout_methods', 'products', 'sales', 'users', 'user_balances', 'checkout_settings'];

    if (!allowedTables.includes(table)) {
      console.log('Tabela inválida');
      return false
    }
    const query = `
        DELETE FROM ${table} WHERE id = $1;
      `;

    try {
      // Executando a consulta com o parâmetro userUid
      const result = await pool.query(query, [id]);
      const data = result.rows;
      console.log('Resultado da consulta:', data)
      return true
    } catch (err) {
      console.error('Erro na consulta:', err);
      return false
    }


  }


  static async getPayoutMethod(id) {
    const query = `
        SELECT * FROM public.payout_methods WHERE id = $1;
      `;

    try {
      // Executando a consulta com o parâmetro userUid
      const result = await pool.query(query, [id]);
      const data = result.rows[0];

      // Verificando se a consulta retornou resultados
      if (result.rows.length > 0) {
        console.log('Resultado da consulta:', data)
        return data;
      } else {
        console.log('Nenhum metodo de pagamento encontrado.');
        return {
          code: 404,
          message: 'Nenhum metodo de pagamento encontrado.'
        };
      }
    } catch (err) {
      console.error('Erro na consulta:', err);
      return false
    }
  }

  static async setPayoutMethod(user_id, id, account_holder, account_id, method_type) {
    const verify_query = `SELECT * FROM public.payout_methods WHERE user_uid = $1`;
    const verify_quantity = await pool.query(verify_query, [user_id]);

    console.log('Quantidade de métodos de pagamento:', verify_quantity.rowCount)

    if (verify_quantity.rowCount >= 3) {
      console.log('Máximo de métodos de pagamento atingido!')
      return false
    }
    else {

      try {
        let query = ``;

        if (!id) {
          query = `
                INSERT INTO public.payout_methods (user_uid, account_holder, account_id, method_type)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
              `;
          const result = await pool.query(query, [user_id, account_holder, account_id, method_type])
          console.log('Método de pagamento salvo:', result.rows[0])
          return true
        } else {
          query = `
                UPDATE public.payout_methods
                SET account_holder = $1, account_id = $2, method_type = $3
                WHERE id = $4
                RETURNING *;
              `;
          const result = await pool.query(query, [account_holder, account_id, method_type, id])
          console.log('Método de pagamento atualizado:', result.rows[0])
          return true
        }

      } catch (error) {
        console.error('Erro ao salvar método de pagamento:', error.message)
        return false

      }

    }


  }




}



class DataUpdateUtils {
  static async saveUserData(data) {
    const query = `
      UPDATE public.users
      SET name = $1, email = $2, national_id = $3, contact = $4
      WHERE uid = $5
      RETURNING *;
    `

    try {
      const result = await pool.query(query, [data.name, data.email, data.national_id, data.contact, data.user_id])
      console.log('Usuário atualizado:', result.rows[0])
      return true
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err.message)
      return false
    }

  }




}

class DbCreateUtils {
  static async createProduct(productData) {
    const verify_quantity = `SELECT * FROM public.products WHERE user_uid = $1`;
    const verify_quantity_result = await pool.query(verify_quantity, [productData.userId]);
    console.log('Quantidade de produtos:', verify_quantity_result.rowCount)

    if (verify_quantity_result.rowCount >= 8) {
      console.log('Máximo de produtos atingido!')
      return false
    }
    else {
      console.log('Quantidade de produtos:', verify_quantity_result.rowCount)
      const query = `
      INSERT INTO public.products (user_uid, name, price, description, category, acess_url, image_url, banner_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `

      try {
        const result = await pool.query(query, [productData.userId, productData.product_name, productData.product_price, productData.product_description, productData.category, productData.product_acess, productData.image_url, productData.banner_url])
        console.log('Produto salvo:', result.rows[0])
        return true
      } catch (err) {
        console.error('Erro ao salvar produto:', err.message)
        return false
      }
    }


  }

}


class DbGetDataUtils {
  static async getProducts(req, res) {
    
    const query = `SELECT * FROM public.products WHERE user_uid = $1`;
    try {
      const result = await pool.query(query, [userId])
      console.log('Usuário salvo:', result.rows)
      return result.rows
    } catch (error) {
      console.log(error)
      return false

    }
  }

}










module.exports = {
  DatabaseUtils,
  DataUpdateUtils,
  DbCreateUtils,
  DbGetDataUtils
}
