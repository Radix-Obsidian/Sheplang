export interface DesignAnnotation {
    screens: string[];
    flows: string[];
    accessibilityRules: string[];
}

export class AnnotationParser {
    parse(text: string): DesignAnnotation {
        const result: DesignAnnotation = {
            screens: [],
            flows: [],
            accessibilityRules: []
        };

        const lines = text.split('\n');
        let currentSection = '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Detect sections
            if (trimmed.toLowerCase().includes('screen:')) {
                const screenName = trimmed.split(':')[1].trim();
                if (screenName) result.screens.push(screenName);
                currentSection = 'screen';
            } else if (trimmed.toLowerCase().includes('flow:') || trimmed.toLowerCase().includes('button:')) {
                // Simple heuristic: Buttons often trigger flows
                const flowName = trimmed.split(':')[1]?.trim() || trimmed;
                if (flowName) result.flows.push(flowName);
            } else if (trimmed.toLowerCase().includes('a11y:') || trimmed.toLowerCase().includes('accessibility:')) {
                const rule = trimmed.split(':')[1]?.trim() || trimmed;
                if (rule) result.accessibilityRules.push(rule);
            }
        }

        return result;
    }
}
