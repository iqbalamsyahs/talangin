export default function EditExpensePage({ params }: { params: { groupId: string, expenseId: string } }) {
    return <div>Edit Expense: {params.expenseId} in Group: {params.groupId}</div>;
}
