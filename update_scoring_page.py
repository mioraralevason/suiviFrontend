import re

# Read the original file
with open('D:\\suivilbcft\\src\\components\\Management\\ScoringPage.tsx', 'r', encoding='utf-8') as file:
    content = file.read()

# Define the new handleSaveRule function
new_function = '''  const handleSaveRule = async (data?: any) => {
  console.log('=== DEBUG handleSaveRule ===');
  console.log('Data reçu:', data);

  // Si data est fourni et contient le type single_rule
  if (data?.type === 'single_rule') {
    console.log('✓ Détection du type single_rule depuis les données passées');
    const ruleData = data.rule;
    console.log('Règle à créer:', ruleData);

    try {
      const rule = {
        idRegleNotation: '',
        condition: ruleData.condition,
        noteRi: ruleData.noteRi,
        noteSc: ruleData.noteSc,
      };
      await saveRule(rule, false);

      setModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('✓ Règle unique créée avec succès');
      return;
    } catch (err) {
      console.error('✗ Erreur lors de la sauvegarde de la règle:', err);
      toast.error('Erreur lors de la sauvegarde de la règle');
      return;
    }
  }

  // Si data est fourni et contient le type multiple_rules
  if (data?.type === 'multiple_rules') {
    console.log('✓ Détection du type multiple_rules depuis les données passées');
    const rules = data.rules;
    console.log('Règles à créer:', rules);

    try {
      // Créer chaque règle séparément
      for (const ruleData of rules) {
        console.log('Création de la règle:', ruleData);
        const rule = {
          idRegleNotation: '',
          condition: ruleData.condition,
          noteRi: ruleData.noteRi,
          noteSc: ruleData.noteSc,
        };
        await saveRule(rule, false);
      }

      setModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('✓ Règles multiples créées avec succès');
      return;
    } catch (err) {
      console.error('✗ Erreur lors de la sauvegarde des règles multiples:', err);
      toast.error('Erreur lors de la sauvegarde des règles');
      return;
    }
  }

  // CAS PRÉCÉDENT (rétrocompatibilité pour boolean_dual_rule)
  if (data?.type === 'boolean_dual_rule') {
    console.log('✓ Détection du type boolean_dual_rule depuis les données passées');
    const rules = data.rules;
    console.log('Règles à créer:', rules);

    try {
      // Créer les 2 règles séparément
      for (const ruleData of rules) {
        console.log('Création de la règle:', ruleData);
        const rule = {
          idRegleNotation: '',
          condition: ruleData.condition,
          noteRi: ruleData.noteRi,
          noteSc: ruleData.noteSc,
        };
        await saveRule(rule, false);
      }

      setModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('✓ Règles booléennes créées avec succès');
      return;
    } catch (err) {
      console.error('✗ Erreur lors de la sauvegarde des règles booléennes:', err);
      toast.error('Erreur lors de la sauvegarde des règles booléennes');
      return;
    }
  }

  // Aussi vérifier currentRule.value pour compatibilité avec anciens formulaires
  if (currentRule.value?.type === 'boolean_dual_rule') {
    console.log('✓ Détection via currentRule.value');
    const rules = currentRule.value.rules;

    try {
      for (const ruleData of rules) {
        const rule = {
          idRegleNotation: '',
          condition: ruleData.condition,
          noteRi: ruleData.noteRi,
          noteSc: ruleData.noteSc,
        };
        await saveRule(rule, false);
      }

      setModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    } catch (err) {
      console.error('✗ Erreur lors de la sauvegarde des règles booléennes:', err);
      toast.error('Erreur lors de la sauvegarde des règles booléennes');
      return;
    }
  }

  console.log('currentRule:', currentRule);
  console.log('Passage à la validation normale');

  // CAS NORMAL (tous les autres types - pour rétrocompatibilité)
  if (!currentRule.value && currentRule.value !== 0 && typeof currentRule.value !== 'object') {
    console.log('✗ Validation échouée: valeur requise');
    return toast.error('Valeur requise');
  }

};'''

# Pattern to match the old handleSaveRule function
pattern = r'  const handleSaveRule = async \(booleanData\?: any\) => \{.*?\};'

# Replace the function
updated_content = re.sub(pattern, new_function, content, flags=re.DOTALL)

# Write the updated content back to the file
with open('D:\\suivilbcft\\src\\components\\Management\\ScoringPage.tsx', 'w', encoding='utf-8') as file:
    file.write(updated_content)

print("File updated successfully!")