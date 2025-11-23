/**
 * HTML Templates for ShepLang Project Wizard
 */

export function getWizardStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 20px;
      line-height: 1.5;
    }

    .wizard-container {
      max-width: 800px;
      margin: 0 auto;
      min-height: 600px;
      display: flex;
      flex-direction: column;
    }

    .progress-section {
      margin-bottom: 40px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--vscode-input-background);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .progress-fill {
      height: 100%;
      background: var(--vscode-button-background);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
    }

    .step-content {
      flex: 1;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: var(--vscode-editor-foreground);
    }

    .subtitle {
      font-size: 16px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 30px;
    }

    .option-card {
      background: var(--vscode-input-background);
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .option-card:hover {
      border-color: var(--vscode-button-background);
      transform: translateY(-2px);
    }

    .option-card.selected {
      border-color: var(--vscode-button-background);
      background: var(--vscode-input-background);
    }

    .option-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }

    .option-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .option-description {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
    }

    .input-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    input[type="text"],
    textarea,
    select {
      width: 100%;
      padding: 10px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-size: 14px;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid var(--vscode-panel-border);
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-success {
      background: #28a745;
      color: white;
      font-size: 16px;
      padding: 12px 32px;
    }

    .feature-input {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: center;
    }

    .feature-input input {
      flex: 1;
    }

    .btn-small {
      padding: 8px 16px;
      font-size: 12px;
    }

    .entity-card {
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .entity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .entity-name {
      font-size: 16px;
      font-weight: 600;
    }

    .field-list {
      margin-top: 10px;
    }

    .field-item {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      align-items: center;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: var(--vscode-input-background);
      border-radius: 4px;
      cursor: pointer;
    }

    .checkbox-item:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .checkbox-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .integration-category {
      margin-bottom: 25px;
    }

    .category-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .review-section {
      background: var(--vscode-input-background);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .review-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: var(--vscode-editor-foreground);
    }

    .review-item {
      margin-bottom: 10px;
      padding-left: 20px;
    }

    .review-label {
      font-weight: 500;
      color: var(--vscode-descriptionForeground);
    }

    .review-value {
      margin-left: 10px;
    }

    .edit-link {
      color: var(--vscode-textLink-foreground);
      cursor: pointer;
      text-decoration: underline;
      font-size: 14px;
    }

    .edit-link:hover {
      color: var(--vscode-textLink-activeForeground);
    }

    .error-message {
      color: var(--vscode-errorForeground);
      font-size: 14px;
      margin-top: 5px;
    }

    .success-message {
      color: var(--vscode-testing-iconPassed);
      font-size: 14px;
      margin-top: 5px;
    }
  `;
}

export function getWizardScripts(): string {
  return `
    const vscode = acquireVsCodeApi();
    let wizardState = {
      currentStep: 1,
      totalSteps: 6,
      data: {},
      selectedType: '',
      selectedRole: 'single-user'
    };

    // Initialize from persisted state
    function initialize() {
      const savedState = vscode.getState();
      if (savedState) {
        wizardState = { ...wizardState, ...savedState };
        updateStepContent();
      }
    }

    // Save state
    function saveState() {
      vscode.setState(wizardState);
    }

    // Update step content
    function updateStepContent() {
      updateProgressBar();
      // Content updates are handled by the extension
    }

    // Update progress bar
    function updateProgressBar() {
      const progress = Math.round((wizardState.currentStep / wizardState.totalSteps) * 100);
      document.querySelector('.progress-fill').style.width = progress + '%';
      document.querySelector('.progress-text').textContent = 'Step ' + wizardState.currentStep + ' of ' + wizardState.totalSteps;
    }

    // Navigation
    function nextStep() {
      if (!validateCurrentStep()) return;
      
      saveCurrentStepData();
      wizardState.currentStep++;
      if (wizardState.currentStep > wizardState.totalSteps) {
        wizardState.currentStep = wizardState.totalSteps;
        return;
      }
      
      saveState();
      vscode.postMessage({
        command: 'nextStep',
        data: wizardState.data
      });
    }

    function previousStep() {
      wizardState.currentStep--;
      if (wizardState.currentStep < 1) {
        wizardState.currentStep = 1;
        return;
      }
      
      saveState();
      vscode.postMessage({
        command: 'previousStep'
      });
    }

    function complete() {
      if (!validateCurrentStep()) return;
      
      saveCurrentStepData();
      saveState();
      
      vscode.postMessage({
        command: 'complete',
        data: wizardState.data
      });
    }

    function cancel() {
      vscode.postMessage({
        command: 'cancel'
      });
    }

    // Validation
    function validateCurrentStep() {
      const step = wizardState.currentStep;
      
      switch (step) {
        case 1:
          return validateStep1();
        case 2:
          return validateStep2();
        case 3:
          return validateStep3();
        case 4:
          return validateStep4();
        case 5:
          return validateStep5();
        case 6:
          return validateStep6();
        default:
          return true;
      }
    }

    function validateStep1() {
      const projectName = document.getElementById('projectName').value.trim();
      if (!projectName) {
        showError('Please enter a project name');
        return false;
      }
      
      if (!wizardState.selectedType) {
        showError('Please select a project type');
        return false;
      }
      
      if (wizardState.selectedType === 'custom') {
        const customDesc = document.getElementById('customDesc').value.trim();
        if (!customDesc) {
          showError('Please describe your custom application');
          return false;
        }
      }
      
      hideError();
      return true;
    }

    function validateStep2() {
      const features = getFeatures();
      if (features.length < 2) {
        showError('Please add at least 2 features');
        return false;
      }
      
      if (features.length > 8) {
        showError('Please limit to 8 features maximum');
        return false;
      }
      
      hideError();
      return true;
    }

    function validateStep3() {
      const entities = getEntities();
      if (entities.length === 0) {
        showError('Please add at least one entity');
        return false;
      }
      
      for (const entity of entities) {
        if (entity.fields.length === 0) {
          showError('Entity "' + entity.name + '" needs at least one field');
          return false;
        }
      }
      
      hideError();
      return true;
    }

    function validateStep4() {
      // All options are valid
      return true;
    }

    function validateStep5() {
      // Integrations are optional
      return true;
    }

    function validateStep6() {
      // Review step - always valid
      return true;
    }

    // Data collection
    function saveCurrentStepData() {
      const step = wizardState.currentStep;
      
      switch (step) {
        case 1:
          saveStep1Data();
          break;
        case 2:
          saveStep2Data();
          break;
        case 3:
          saveStep3Data();
          break;
        case 4:
          saveStep4Data();
          break;
        case 5:
          saveStep5Data();
          break;
        case 6:
          saveStep6Data();
          break;
      }
    }

    function saveStep1Data() {
      wizardState.data.projectType = wizardState.selectedType;
      wizardState.data.projectName = document.getElementById('projectName').value.trim();
      wizardState.data.description = getProjectTypeDescription(wizardState.selectedType);
      
      if (wizardState.selectedType === 'custom') {
        wizardState.data.customDescription = document.getElementById('customDesc').value.trim();
      }
    }

    function saveStep2Data() {
      wizardState.data.features = getFeatures();
    }

    function saveStep3Data() {
      wizardState.data.entities = getEntities();
    }

    function saveStep4Data() {
      wizardState.data.roleType = wizardState.selectedRole;
      
      if (wizardState.selectedRole !== 'single-user') {
        wizardState.data.roles = getSelectedRoles();
      }
    }

    function saveStep5Data() {
      wizardState.data.integrations = getSelectedIntegrations();
    }

    function saveStep6Data() {
      wizardState.data.apiStyle = document.querySelector('input[name="apiStyle"]:checked')?.value || 'REST';
      wizardState.data.realtime = document.querySelector('input[name="realtime"]:checked')?.value === 'true';
      wizardState.data.deployment = document.querySelector('select[name="deployment"]')?.value || 'Vercel';
    }

    // Helper functions
    function getFeatures() {
      const features = [];
      const inputs = document.querySelectorAll('.feature-field');
      
      inputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
          features.push({
            name: value,
            description: ''
          });
        }
      });
      
      return features;
    }

    function getEntities() {
      const entities = [];
      const entityCards = document.querySelectorAll('.entity-card');
      
      entityCards.forEach(card => {
        const name = card.querySelector('.entity-name').textContent;
        const fields = [];
        
        const fieldItems = card.querySelectorAll('.field-item');
        fieldItems.forEach(item => {
          const fieldName = item.querySelector('input[type="text"]').value.trim();
          const fieldType = item.querySelector('select').value;
          
          if (fieldName) {
            fields.push({
              name: fieldName,
              type: fieldType,
              required: fieldType === 'text'
            });
          }
        });
        
        if (name && fields.length > 0) {
          entities.push({ name, fields });
        }
      });
      
      return entities;
    }

    function getSelectedRoles() {
      const roles = [];
      const checkboxes = document.querySelectorAll('#rolesSection input[type="checkbox"]:checked');
      
      checkboxes.forEach(cb => {
        roles.push({
          name: cb.nextElementSibling.textContent.trim(),
          permissions: []
        });
      });
      
      return roles;
    }

    function getSelectedIntegrations() {
      const integrations = [];
      const checkboxes = document.querySelectorAll('input[type="checkbox"][data-service]:checked');
      
      checkboxes.forEach(cb => {
        integrations.push({
          category: cb.dataset.category,
          service: cb.dataset.service
        });
      });
      
      return integrations;
    }

    function getProjectTypeDescription(type) {
      const descriptions = {
        'mobile-first': 'Mobile-first application',
        'saas-dashboard': 'SaaS dashboard application',
        'ecommerce': 'E-commerce store',
        'content-platform': 'Content platform',
        'custom': 'Custom application'
      };
      
      return descriptions[type] || '';
    }

    // UI helpers
    function showError(message) {
      const existing = document.querySelector('.error-message');
      if (existing) existing.remove();
      
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      error.id = 'errorMessage';
      
      document.querySelector('.step-content').appendChild(error);
    }

    function hideError() {
      const error = document.getElementById('errorMessage');
      if (error) error.remove();
    }

    function showSuccess(message) {
      const existing = document.querySelector('.success-message');
      if (existing) existing.remove();
      
      const success = document.createElement('div');
      success.className = 'success-message';
      success.textContent = message;
      success.id = 'successMessage';
      
      document.querySelector('.step-content').appendChild(success);
    }

    // Event handlers
    document.addEventListener('DOMContentLoaded', function() {
      initialize();
      
      // Step 1: Project type selection
      document.querySelectorAll('.option-card[data-type]').forEach(card => {
        card.addEventListener('click', function() {
          document.querySelectorAll('.option-card[data-type]').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          wizardState.selectedType = card.dataset.type;
          
          const customDesc = document.getElementById('customDescription');
          if (customDesc) {
            customDesc.style.display = wizardState.selectedType === 'custom' ? 'block' : 'none';
          }
        });
      });
      
      // Step 4: Role type selection
      document.querySelectorAll('.option-card[data-role]').forEach(card => {
        card.addEventListener('click', function() {
          document.querySelectorAll('.option-card[data-role]').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          wizardState.selectedRole = card.dataset.role;
          
          const rolesSection = document.getElementById('rolesSection');
          if (rolesSection) {
            rolesSection.style.display = wizardState.selectedRole === 'single-user' ? 'none' : 'block';
          }
        });
      });
    });

    // Make functions global for onclick handlers
    window.nextStep = nextStep;
    window.previousStep = previousStep;
    window.complete = complete;
    window.cancel = cancel;
    window.addFeature = addFeature;
    window.removeFeature = removeFeature;
    window.addEntity = addEntity;
    window.removeEntity = removeEntity;
    window.addField = addField;
    window.removeField = removeField;
    window.parseEntities = parseEntities;
    window.editSection = editSection;

    function addFeature() {
      const featuresList = document.getElementById('featuresList');
      const featureInput = document.createElement('div');
      featureInput.className = 'feature-input';
      featureInput.innerHTML = \`
        <input type="text" class="feature-field" placeholder="New feature">
        <button class="btn btn-small btn-secondary" onclick="removeFeature(this)">Remove</button>
      \`;
      featuresList.appendChild(featureInput);
    }

    function removeFeature(button) {
      button.parentElement.remove();
    }

    function addEntity() {
      const entitiesList = document.getElementById('entitiesList');
      const entityCard = document.createElement('div');
      entityCard.className = 'entity-card';
      entityCard.innerHTML = \`
        <div class="entity-header">
          <div class="entity-name">New Entity</div>
          <button class="btn btn-small btn-secondary" onclick="removeEntity(this)">Remove</button>
        </div>
        <div class="field-list">
          <div class="field-item">
            <input type="text" placeholder="Field name" style="flex: 1;">
            <select style="width: 120px;">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="yes/no">Yes/No</option>
              <option value="image">Image</option>
            </select>
            <button class="btn btn-small btn-secondary" onclick="removeField(this)">×</button>
          </div>
          <button class="btn btn-small btn-secondary" onclick="addField(this)">+ Add Field</button>
        </div>
      \`;
      entitiesList.appendChild(entityCard);
    }

    function removeEntity(button) {
      button.closest('.entity-card').remove();
    }

    function addField(button) {
      const fieldList = button.parentElement;
      const fieldItem = document.createElement('div');
      fieldItem.className = 'field-item';
      fieldItem.innerHTML = \`
        <input type="text" placeholder="Field name" style="flex: 1;">
        <select style="width: 120px;">
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="yes/no">Yes/No</option>
          <option value="image">Image</option>
        </select>
        <button class="btn btn-small btn-secondary" onclick="removeField(this)">×</button>
      \`;
      fieldList.insertBefore(fieldItem, button);
    }

    function removeField(button) {
      button.parentElement.remove();
    }

    function parseEntities() {
      const input = document.getElementById('entityInput').value.trim();
      if (!input) return;
      
      vscode.postMessage({
        command: 'parseEntities',
        data: input
      });
    }

    function editSection(step) {
      wizardState.currentStep = step;
      saveState();
      vscode.postMessage({
        command: 'goToStep',
        data: step
      });
    }
  `;
}
