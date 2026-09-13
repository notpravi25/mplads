import os
import unittest
from src.modules.material_fairness import (
    analyze_material_price_fairness,
    extract_material_attributes,
    load_specification_benchmarks,
    SAMPLE_DOCUMENTS
)

class TestMaterialFairnessEngine(unittest.TestCase):
    def setUp(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    def test_load_benchmarks(self):
        df = load_specification_benchmarks(self.base_dir)
        self.assertFalse(df.empty)
        self.assertIn("grade", df.columns)
        self.assertIn("reference_price", df.columns)

    def test_overpriced_cement_analysis(self):
        sample = SAMPLE_DOCUMENTS[0]  # Overpriced OPC 53 Cement
        res = analyze_material_price_fairness(
            sample_id=sample["id"],
            base_dir=self.base_dir
        )
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["extracted_attributes"]["material"], "Cement")
        self.assertEqual(res["extracted_attributes"]["grade"], "OPC 53 Grade")
        self.assertEqual(res["fairness_assessment"]["label"], "Price is above the reference range")
        self.assertGreater(res["price_comparison"]["price_difference_pct"], 15.0)

    def test_fair_steel_analysis(self):
        sample = SAMPLE_DOCUMENTS[1]  # Fair Fe500D TMT Steel
        res = analyze_material_price_fairness(
            sample_id=sample["id"],
            base_dir=self.base_dir
        )
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["extracted_attributes"]["grade"], "Fe500D Grade")
        self.assertEqual(res["fairness_assessment"]["label"], "Price appears reasonable")

    def test_substandard_low_pipe_analysis(self):
        sample = SAMPLE_DOCUMENTS[3]  # Low quoted UPVC pipe
        res = analyze_material_price_fairness(
            sample_id=sample["id"],
            base_dir=self.base_dir
        )
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["fairness_assessment"]["label"], "Potential price anomaly (Low / Substandard risk)")
        self.assertLess(res["price_comparison"]["price_difference_pct"], -20.0)

    def test_ambiguous_generic_spec(self):
        sample = SAMPLE_DOCUMENTS[4]  # Generic un-specified cement
        res = analyze_material_price_fairness(
            sample_id=sample["id"],
            base_dir=self.base_dir
        )
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["fairness_assessment"]["status"], "INSUFFICIENT_DATA")
        self.assertEqual(res["fairness_assessment"]["label"], "Requires Review (Insufficient Data)")

    def test_disallowed_terms_guard(self):
        res = analyze_material_price_fairness(
            sample_id="sample_cement_opc53_overpriced",
            base_dir=self.base_dir
        )
        explanation = res["fairness_assessment"]["explanation"].lower()
        label = res["fairness_assessment"]["label"].lower()
        for term in ["fraud", "corrupt", "illegal", "criminal", "scam"]:
            self.assertNotIn(term, explanation)
            self.assertNotIn(term, label)

if __name__ == "__main__":
    unittest.main()
