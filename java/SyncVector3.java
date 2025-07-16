import org.json.JSONObject;
import org.json.JSONException;

public class SyncVector3 {
    public double x, y, z;

    public SyncVector3(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public static SyncVector3 fromJSON(JSONObject json) {
        double x = 0, y = 0, z = 0;
        try { x = json.getDouble("x"); } catch (JSONException ignored) {}
        try { y = json.getDouble("y"); } catch (JSONException ignored) {}
        try { z = json.getDouble("z"); } catch (JSONException ignored) {}
        return new SyncVector3(x, y, z);
    }

    public JSONObject toJSON() {
        JSONObject json = new JSONObject();
        try {
            json.put("x", x);
            json.put("y", y);
            json.put("z", z);
        } catch (JSONException ignored) {}
        return json;
    }
}
