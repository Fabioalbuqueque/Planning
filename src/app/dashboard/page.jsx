'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  StylesMain,
  StylesHeader,
  StylesTitle,
  StylesUserInfo,
  StylesUserName,
  StylesUserEmail,
  StylesLogoutButton,
  StylesContent,
  StylesAddButton,
  StylesModal,
  StylesModalContent,
  StylesModalHeader,
  StylesModalClose,
  StylesModalForm,
  StylesModalInput,
  StylesModalSelect,
  StylesModalButton,
  StylesSummaryCards,
  StylesSummaryCard,
  StylesSummaryTitle,
  StylesSummaryValue,
  StylesActivitiesList,
  StylesActivitiesTitle,
  StylesActivityItem,
  StylesActivityInfo,
  StylesActivityDescription,
  StylesActivityDate,
  StylesActivityValue,
  StylesNoActivities,
  StylesActivityActions,
  StylesEditButton,
  StylesSaveButton,
  StylesCancelButton,
  StylesActivityEditForm,
  StylesActivityEditInput,
  StylesActivityEditSelect,
  StylesDeleteButton,
  StylesPasswordModal,
  StylesPasswordModalContent,
  StylesPasswordModalHeader,
  StylesPasswordModalTitle,
  StylesPasswordModalClose,
  StylesPasswordModalForm,
  StylesPasswordModalInput,
  StylesPasswordModalButton,
  StylesPasswordModalError
} from './dashboard.style'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activityName, setActivityName] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    type: 'receita',
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    // Buscar dados do usuário no localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))

    // Buscar transações do localStorage
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]')
    setTransactions(storedTransactions)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleAddTransaction = (e) => {
    e.preventDefault()
    
    const newTransaction = {
      id: Date.now(),
      ...formData,
      value: parseFloat(formData.value)
    }

    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions))
    
    setShowModal(false)
    setFormData({
      type: 'receita',
      description: '',
      value: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    
    const updatedTransactions = transactions.map(t => 
      t.id === editingTransaction.id ? editingTransaction : t
    )
    
    setTransactions(updatedTransactions)
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions))
    setEditingTransaction(null)
  }

  const handleCancelEdit = () => {
    setEditingTransaction(null)
  }

  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = (e) => {
    e.preventDefault()
    
    if (activityName !== transactionToDelete.description) {
      setDeleteError('Nome da atividade incorreto')
      return
    }

    const updatedTransactions = transactions.filter(t => t.id !== transactionToDelete.id)
    setTransactions(updatedTransactions)
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions))
    
    setShowDeleteModal(false)
    setActivityName('')
    setDeleteError('')
    setTransactionToDelete(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditingTransaction(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getTotal = (type) => {
    return transactions
      .filter(t => t.type === type)
      .reduce((total, t) => total + t.value, 0)
  }

  const getSaldo = () => {
    const totalReceitas = getTotal('receita')
    const totalGastos = getTotal('gasto')
    return totalReceitas - totalGastos
  }

  if (!user) {
    return null
  }

  return (
    <StylesMain>
      <StylesHeader>
      <StylesUserName>{user.name}</StylesUserName>
     
        <StylesAddButton onClick={() => setShowModal(true)}>
           Adicionar
        </StylesAddButton>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StylesUserInfo>
           
            <StylesUserEmail>{user.email}</StylesUserEmail>
          </StylesUserInfo>
          <StylesLogoutButton onClick={handleLogout}>
            Sair
          </StylesLogoutButton>
        </div>
      </StylesHeader>

      <StylesContent>
        <StylesSummaryCards>
          <StylesSummaryCard>
            <StylesSummaryTitle>Saldo Atual</StylesSummaryTitle>
            <StylesSummaryValue type="saldo">
              {formatCurrency(getSaldo())}
            </StylesSummaryValue>
          </StylesSummaryCard>

          <StylesSummaryCard>
            <StylesSummaryTitle>Entradas</StylesSummaryTitle>
            <StylesSummaryValue type="entrada">
              {formatCurrency(getTotal('receita'))}
            </StylesSummaryValue>
          </StylesSummaryCard>

          <StylesSummaryCard>
            <StylesSummaryTitle>Gastos</StylesSummaryTitle>
            <StylesSummaryValue type="gasto">
              {formatCurrency(getTotal('gasto'))}
            </StylesSummaryValue>
          </StylesSummaryCard>
        </StylesSummaryCards>

        

        <StylesActivitiesList>
          <StylesActivitiesTitle>Últimas Atividades</StylesActivitiesTitle>
          {transactions.length === 0 ? (
            <StylesNoActivities>Nenhuma atividade registrada</StylesNoActivities>
          ) : (
            transactions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map(transaction => (
                <StylesActivityItem key={transaction.id}>
                  {editingTransaction?.id === transaction.id ? (
                    <StylesActivityEditForm onSubmit={handleSaveEdit}>
                      <StylesActivityEditSelect
                        name="type"
                        value={editingTransaction.type}
                        onChange={handleEditChange}
                      >
                        <option value="receita">Receita</option>
                        <option value="gasto">Gasto</option>
                      </StylesActivityEditSelect>
                      
                      <StylesActivityEditInput
                        type="text"
                        name="description"
                        value={editingTransaction.description}
                        onChange={handleEditChange}
                        required
                      />
                      
                      <StylesActivityEditInput
                        type="number"
                        name="value"
                        value={editingTransaction.value}
                        onChange={handleEditChange}
                        step="0.01"
                        min="0"
                        required
                      />
                      
                      <StylesActivityEditInput
                        type="date"
                        name="date"
                        value={editingTransaction.date}
                        onChange={handleEditChange}
                        required
                      />
                      
                      <StylesActivityActions>
                        <StylesSaveButton type="submit">
                          Salvar
                        </StylesSaveButton>
                        <StylesCancelButton type="button" onClick={handleCancelEdit}>
                          Cancelar
                        </StylesCancelButton>
                      </StylesActivityActions>
                    </StylesActivityEditForm>
                  ) : (
                    <>
                      <StylesActivityInfo>
                        <StylesActivityDescription>
                          {transaction.description}
                        </StylesActivityDescription>
                        <StylesActivityDate>
                          {formatDate(transaction.date)}
                        </StylesActivityDate>
                      </StylesActivityInfo>
                      <StylesActivityValue type={transaction.type}>
                        {formatCurrency(transaction.value)}
                      </StylesActivityValue>
                      <StylesActivityActions>
                        <StylesEditButton onClick={() => handleEditTransaction(transaction)}>
                          Editar
                        </StylesEditButton>
                        <StylesDeleteButton onClick={() => handleDeleteTransaction(transaction)}>
                          Apagar
                        </StylesDeleteButton>
                      </StylesActivityActions>
                    </>
                  )}
                </StylesActivityItem>
              ))
          )}
        </StylesActivitiesList>

        {showModal && (
          <StylesModal>
            <StylesModalContent>
              <StylesModalHeader>
                <h2>Adicionar Transação</h2>
                <StylesModalClose onClick={() => setShowModal(false)}>
                  ×
                </StylesModalClose>
              </StylesModalHeader>

              <StylesModalForm onSubmit={handleAddTransaction}>
                <StylesModalSelect
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="receita">Receita</option>
                  <option value="gasto">Gasto</option>
                </StylesModalSelect>

                <StylesModalInput
                  type="text"
                  name="description"
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />

                <StylesModalInput
                  type="number"
                  name="value"
                  placeholder="Valor"
                  value={formData.value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />

                <StylesModalInput
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

                <StylesModalButton type="submit">
                  Adicionar
                </StylesModalButton>
              </StylesModalForm>
            </StylesModalContent>
          </StylesModal>
        )}

        {showDeleteModal && (
          <StylesPasswordModal>
            <StylesPasswordModalContent>
              <StylesPasswordModalHeader>
                <StylesPasswordModalTitle>Confirmar Exclusão</StylesPasswordModalTitle>
                <StylesPasswordModalClose onClick={() => {
                  setShowDeleteModal(false)
                  setActivityName('')
                  setDeleteError('')
                  setTransactionToDelete(null)
                }}>
                  ×
                </StylesPasswordModalClose>
              </StylesPasswordModalHeader>

              <StylesPasswordModalForm onSubmit={handleConfirmDelete}>
                <p style={{ marginBottom: '1rem' }}>
                  Digite o nome da atividade para confirmar a exclusão:
                </p>
                <StylesPasswordModalInput
                  type="text"
                  placeholder="Digite o nome da atividade"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  required
                />
                {deleteError && (
                  <StylesPasswordModalError>{deleteError}</StylesPasswordModalError>
                )}
                <StylesPasswordModalButton type="submit">
                  Confirmar
                </StylesPasswordModalButton>
              </StylesPasswordModalForm>
            </StylesPasswordModalContent>
          </StylesPasswordModal>
        )}
      </StylesContent>
    </StylesMain>
  )
} 