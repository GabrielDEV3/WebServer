import org.json.JSONObject;
import org.json.JSONException;

public class SyncVector2 {
    public double x, y;

    public SyncVector2(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public static SyncVector2 fromJSON(JSONObject json) {
        double x = 0, y = 0;
        try { x = json.getDouble("x"); } catch (JSONException ignored) {}
        try { y = json.getDouble("y"); } catch (JSONException ignored) {}
        return new SyncVector2(x, y);
    }

    public JSONObject toJSON() {
        JSONObject json = new JSONObject();
        try {
            json.put("x", x);
            json.put("y", y);
        } catch (JSONException ignored) {}
        return json;
    }
}
