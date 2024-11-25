import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [ra, setRA] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://backend-aula.vercel.app/app/login", {
        usuario: ra,
        senha: senha
      });

        if (response.data.token) {
            // Armazena o token no localStorage
            localStorage.setItem("token", response.data.token);
            onLogin(ra);
        } else {
            setError("Login falhou. Verifique suas credenciais.");
        }
    } catch (err) {
      setError("Erro no login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container">
        <h2>Login</h2>
        {error && <p style={{ color: 'white' }}>{error}</p>}
        <input
            type="text"
            placeholder="RA"
            value={ra}
            onChange={(e) => setRA(e.target.value)}
        />
        <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Login"}
        </button>
        <p>
          <button onClick={onSwitchToRegister}>Registrar-se</button>
        </p>
      </div>
  );
};

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [ra, setRA] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (senha !== confirmSenha) {
      setError("As senhas precisam ser iguais.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://backend-aula.vercel.app/app/registrar", {
        usuario: ra,
        senha: senha,
        confirma: confirmSenha
      });

        console.log("Resposta da API:", response.data);

      if (response.data._id) {
        onRegister();
      } else {
        setError(response.data.error || "Erro no registro.");
      }
    } catch (err) {
      setError("Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container">
        <h2>Registro</h2>
        {error && <p style={{ color: 'white' }}>{error}</p>}
        <input
            type="text"
            placeholder="RA"
            value={ra}
            onChange={(e) => setRA(e.target.value)}
        />
        <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
        />
        <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
        />
        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </button>
        <p>
          <button onClick={onSwitchToLogin}>Voltar</button>
        </p>
        
      </div>
  );
};

const Products = () => {
    const [produtos, setProdutos] = useState([]);
    const [view, setView] = useState(""); // Estado para controlar qual formulário exibir
    const [nome, setNome] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [preco, setPreco] = useState("");
    const [descricao, setDescricao] = useState("");
    const [imagem, setImagem] = useState("");
    const [idEditando, setIdEditando] = useState(null);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const token = localStorage.getItem("token");

    // Função para buscar produtos
    const fetchProdutos = async () => {
        try {
            const response = await axios.get("https://backend-aula.vercel.app/app/produtos", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProdutos(response.data);
            setView("listar");
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            setError("Erro ao buscar produtos.");
        }
    };

    const clearForm = () => {
        setNome("");
        setQuantidade("");
        setPreco("");
        setDescricao("");
        setImagem("");
        setIdEditando(null);
        setError("");
    };

    const handleAddClick = () => {
        setView("adicionar");
        clearForm();
    };

    const handleEditClick = () => {
        setView("alterar");
    };

    const handleListClick = () => {
        fetchProdutos();
    };

    const filteredProdutos = produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteClick = () => {
        setView("deletar");
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete('https://backend-aula.vercel.app/app/produtos', {
                data: { id: id }, // Enviar o ID no corpo, conforme o backend espera
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProdutos(produtos.filter((produto) => produto._id !== id));  // Remove o produto da lista local
        } catch (err) {
            console.error("Erro ao deletar produto:", err);
            setError("Erro ao deletar produto.");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const produto = {
            id: idEditando, // Adiciona o id do produto que está sendo editado
            nome,
            quantidade,
            preco,
            descricao,
            imagem,
        };

        try {
            if (idEditando) {
                // Editar produto
                await axios.put(`https://backend-aula.vercel.app/app/produtos`, produto, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProdutos(produtos.map((p) => (p._id === idEditando ? { ...p, ...produto } : p)));
            } else {
                // Adicionar novo produto
                const response = await axios.post("https://backend-aula.vercel.app/app/produtos", produto, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProdutos([...produtos, response.data]);
            }
            clearForm();
            setView("");
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            setError("Erro ao salvar produto.");
        }
    };

    return (
        <div className="container">
            {error && <p style={{ color: "red" }}>{error}</p>}

            {view === "" && (
                <div className="button-grid">
                    <button onClick={handleAddClick} className="button button-large">Adicionar</button>
                    <button onClick={handleListClick} className="button button-large">Listar</button>
                </div>
            )}

{view === "listar" && (
                <div>
                    <h3>Produtos Cadastrados:</h3>

                    {/* Campo de busca */}
                    <input
                        type="text"
                        placeholder="Pesquise o produto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    {filteredProdutos.length > 0 ? (
                        <div className="product-grid">
                            {filteredProdutos.map((produto) => (
                                <div key={produto._id} className="product-card">
                                    <p><strong>{produto.nome}</strong></p>
                                    <p>Quantidade: {produto.quantidade}</p>
                                    <p>Preço: R$ {produto.preco}</p>
                                    <p>{produto.descricao}</p>
                                    <div className="button-group">
                                        <button onClick={() => {
                                            setNome(produto.nome);
                                            setQuantidade(produto.quantidade);
                                            setPreco(produto.preco);
                                            setDescricao(produto.descricao);
                                            setImagem(produto.imagem);
                                            setIdEditando(produto._id);
                                            setView("alterar");
                                        }}>Editar</button>
                                    <button onClick={() => handleDelete(produto._id)}>Excluir</button>
                                </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Nenhum produto encontrado.</p>
                    )}
                
                    <button className="back-button" onClick={() => setView("")}>Voltar</button>
                </div>
            )}
        




            {view === "adicionar" && (
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    <input type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
                    <input type="number" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} required />
                    <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
                    <input type="text" placeholder="Imagem" value={imagem} onChange={(e) => setImagem(e.target.value)} required />

                    {/* Adicionar um contêiner de botões */}
                    <div className="button-container">
                        <button type="submit">Adicionar Produto</button>
                        <button type="button" onClick={() => setView("")}>Voltar</button>
                    </div>
                </form>
            )}

            {view === "alterar" && (
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    <input type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
                    <input type="number" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} required />
                    <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
                    <input type="text" placeholder="Imagem" value={imagem} onChange={(e) => setImagem(e.target.value)} required />

                    <div className="button-container">
                        <button type="submit">Salvar</button>
                        <button type="button" onClick={() => setView("listar")}>Voltar</button>
                    </div>
                </form>
            )}

        </div>
    );
};



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [ra, setRA] = useState(null);

  const handleLogin = (ra) => {
    setRA(ra);
    setIsLoggedIn(true);
  };

  const handleSwitchToRegister = () => {
    setIsRegistering(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegistering(false);
  };

  return (
      <div>
        {isLoggedIn ? (
            <Products />
        ) : (
            isRegistering ? (
                <Register onRegister={handleSwitchToLogin} onSwitchToLogin={handleSwitchToLogin} />
            ) : (
                <Login onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />
            )
        )}
      </div>
  );
}

export default App;
